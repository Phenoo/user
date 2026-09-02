import { type NextRequest, NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";

import { api } from "@/convex/_generated/api";
import {
  type ClassroomCourse,
  type ClassroomCourseWork,
  type ClassroomCourseWorkMaterial,
  type ClassroomMaterial,
  createGoogleMeetService,
} from "@/lib/google-meet";
import {
  resolveGoogleCredentials,
  setGoogleCredentialCookies,
} from "@/lib/integrations/google/credentials";
import { GoogleAuthError } from "@/lib/integrations/google/tokens";
import { getAuthenticatedUser } from "@/lib/server/convex-auth";

interface ImportedMaterial {
  externalId: string;
  title: string;
  url: string;
  mimeType?: string;
  description?: string;
  updateTime?: string;
}

function getCourseWorkDueDate(courseWork: ClassroomCourseWork) {
  if (!courseWork.dueDate) {
    return undefined;
  }

  const { year, month, day } = courseWork.dueDate;
  const { hours = 23, minutes = 59, seconds = 0 } = courseWork.dueTime ?? {};
  return new Date(
    Date.UTC(year, month - 1, day, hours, minutes, seconds)
  ).toISOString();
}

function normalizeMaterial(
  material: ClassroomMaterial,
  externalPrefix: string,
  fallbackTitle: string,
  description?: string,
  updateTime?: string
): ImportedMaterial | null {
  if (material.driveFile?.driveFile) {
    const file = material.driveFile.driveFile;
    if (!file.alternateLink) return null;
    return {
      externalId: `${externalPrefix}:drive:${file.id}`,
      title: file.title || fallbackTitle,
      url: file.alternateLink,
      mimeType: file.mimeType,
      description,
      updateTime,
    };
  }

  if (material.youtubeVideo) {
    const video = material.youtubeVideo;
    return {
      externalId: `${externalPrefix}:youtube:${video.id}`,
      title: video.title || fallbackTitle,
      url:
        video.alternateLink ||
        `https://www.youtube.com/watch?v=${encodeURIComponent(video.id)}`,
      mimeType: "video/youtube",
      description,
      updateTime,
    };
  }

  if (material.link?.url) {
    return {
      externalId: `${externalPrefix}:link:${material.link.url}`,
      title: material.link.title || fallbackTitle,
      url: material.link.url,
      mimeType: "text/uri-list",
      description,
      updateTime,
    };
  }

  if (material.form?.formUrl) {
    return {
      externalId: `${externalPrefix}:form:${material.form.formUrl}`,
      title: material.form.title || fallbackTitle,
      url: material.form.formUrl,
      mimeType: "application/vnd.google-apps.form",
      description,
      updateTime,
    };
  }

  return null;
}

function collectMaterials(
  courseId: string,
  courseWork: ClassroomCourseWork[],
  courseWorkMaterials: ClassroomCourseWorkMaterial[]
) {
  const imported = new Map<string, ImportedMaterial>();

  for (const item of courseWork) {
    item.materials?.forEach((material) => {
      const normalized = normalizeMaterial(
        material,
        `${courseId}:coursework:${item.id}`,
        item.title,
        item.description,
        item.updateTime
      );
      if (normalized) imported.set(normalized.externalId, normalized);
    });
  }

  for (const item of courseWorkMaterials) {
    item.materials?.forEach((material) => {
      const normalized = normalizeMaterial(
        material,
        `${courseId}:material:${item.id}`,
        item.title,
        item.description,
        item.updateTime
      );
      if (normalized) imported.set(normalized.externalId, normalized);
    });

    if (!item.materials?.length && item.alternateLink) {
      const material: ImportedMaterial = {
        externalId: `${courseId}:material:${item.id}:classroom`,
        title: item.title,
        url: item.alternateLink,
        mimeType: "text/uri-list",
        description: item.description,
        updateTime: item.updateTime,
      };
      imported.set(material.externalId, material);
    }
  }

  return Array.from(imported.values());
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>
) {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker())
  );
  return results;
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  const authentication = await getAuthenticatedUser();

  if (!authentication) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { token, user } = authentication;

  try {
    const credentials = await resolveGoogleCredentials(
      request,
      authentication,
      "classroom"
    );

    await fetchMutation(
      api.integrations.upsertConnectedAccount,
      {
        userId: user._id,
        provider: "google-classroom",
        email: credentials.email,
        scopes: credentials.scopes,
        status: "connected",
      },
      { token }
    );

    const service = createGoogleMeetService();
    service.setAccessToken(credentials.accessToken);
    const courses = await service.getClassroomCourses();

    const syncResults = await mapWithConcurrency<ClassroomCourse, {
      courseCreated: boolean;
      assignmentsCreated: number;
      assignmentsUpdated: number;
      materialsCreated: number;
      materialsUpdated: number;
    }>(courses, 4, async (course) => {
      const [courseWork, courseWorkMaterials] = await Promise.all([
        service.getClassroomCourseWork(course.id),
        service.getClassroomCourseWorkMaterials(course.id),
      ]);

      return await fetchMutation(
        api.integrations.syncClassroomCourse,
        {
          course: {
            id: course.id,
            name: course.name,
            section: course.section,
            description: course.description || course.descriptionHeading,
            alternateLink: course.alternateLink,
            updateTime: course.updateTime,
          },
          courseWork: courseWork.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            dueDate: getCourseWorkDueDate(item),
            alternateLink: item.alternateLink,
            updateTime: item.updateTime,
          })),
          materials: collectMaterials(
            course.id,
            courseWork,
            courseWorkMaterials
          ),
        },
        { token }
      );
    });

    const totals = syncResults.reduce(
      (total, result) => ({
        coursesCreated: total.coursesCreated + Number(result.courseCreated),
        coursesUpdated: total.coursesUpdated + Number(!result.courseCreated),
        assignmentsCreated:
          total.assignmentsCreated + result.assignmentsCreated,
        assignmentsUpdated:
          total.assignmentsUpdated + result.assignmentsUpdated,
        materialsCreated: total.materialsCreated + result.materialsCreated,
        materialsUpdated: total.materialsUpdated + result.materialsUpdated,
      }),
      {
        coursesCreated: 0,
        coursesUpdated: 0,
        assignmentsCreated: 0,
        assignmentsUpdated: 0,
        materialsCreated: 0,
        materialsUpdated: 0,
      }
    );

    await fetchMutation(
      api.integrations.recordSync,
      {
        userId: user._id,
        provider: "google-classroom",
        type: "full-sync",
        status: "success",
        startedAt,
        completedAt: Date.now(),
        importedCount:
          totals.coursesCreated +
          totals.assignmentsCreated +
          totals.materialsCreated,
        updatedCount:
          totals.coursesUpdated +
          totals.assignmentsUpdated +
          totals.materialsUpdated,
        failedCount: 0,
        metadata: totals,
      },
      { token }
    );

    const response = NextResponse.json({
      success: true,
      message: `Synced ${courses.length} Classroom courses, ${totals.assignmentsCreated + totals.assignmentsUpdated} assignments, and ${totals.materialsCreated + totals.materialsUpdated} materials.`,
      totals,
    });

    setGoogleCredentialCookies(response, credentials);

    return response;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to sync Google Classroom";

    try {
      await fetchMutation(
        api.integrations.recordSync,
        {
          userId: user._id,
          provider: "google-classroom",
          type: "full-sync",
          status: "failed",
          startedAt,
          completedAt: Date.now(),
          failedCount: 1,
          error: message,
        },
        { token }
      );
    } catch (recordError) {
      console.error("[ClassroomSync] Could not record failed sync:", recordError);
    }

    if (error instanceof GoogleAuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.code === "INSUFFICIENT_SCOPE" ? 403 : 401 }
      );
    }

    console.error("[ClassroomSync] Error syncing Google Classroom:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
