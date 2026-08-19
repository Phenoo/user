"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "convex/react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import { GoArrowUpRight } from "react-icons/go";
import { MdCalculate } from "react-icons/md";

import { CiSettings } from "react-icons/ci";

import { gradePoints, calculateCourseGrade } from "@/lib/gpa-utils";

interface CourseWithGrade {
  id: string;
  name: string;
  code: string;
  credits: number;
  grade: string;
  semester: string;
  year: string;
  category: string;
  finalScore?: number;
}

const CpaCard = () => {
  const user = useQuery(api.users.currentUser);
  const userId = user?._id;

  const courses =
    useQuery(
      api.courses.getAllCourses,
      userId ? { userId: userId as Id<"users"> } : "skip"
    ) || [];
  const assessments =
    useQuery(
      api.assessments.getUserAssessments,
      userId ? { userId: userId as Id<"users"> } : "skip"
    ) || [];
  const settings = useQuery(
    api.settings.getUserSettings,
    userId ? { userId: userId as Id<"users"> } : "skip"
  );

  if (user === undefined) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-3 w-16" />
        </CardContent>
      </Card>
    );
  }

  const coursesWithGrades: CourseWithGrade[] = courses.map((course) => {
    const courseAssessments = assessments.filter(
      (a) => a.courseId === course._id
    );
    const { percentage, letterGrade } = calculateCourseGrade(courseAssessments);

    return {
      id: course._id,
      name: course.name,
      code: course.code,
      credits: course.credits,
      grade: letterGrade,
      semester: course.session,
      year: course.academicYear.split("-")[0],
      category: "Major Requirements",
      finalScore: percentage,
    };
  });

  const calculateGPA = (coursesToCalculate: CourseWithGrade[]) => {
    if (coursesToCalculate.length === 0) return 0;
    const totalPoints = coursesToCalculate.reduce((sum, course) => {
      return sum + (gradePoints[course.grade] ?? 0) * course.credits;
    }, 0);
    const totalCredits = coursesToCalculate.reduce(
      (sum, course) => sum + course.credits,
      0
    );
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  };

  const overallGPA = calculateGPA(coursesWithGrades);
  const targetGpa = settings?.gpaTarget ?? 4.5;

  return (
    <Card className="">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm">Current GPA</CardTitle>

          <Link href={"/dashboard/settings?section=goals"}>
            <Button size={"icon"} variant={"outline"}>
              <CiSettings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold ">{overallGPA.toFixed(2)}</span>
          <span className="text-xs text-muted-foreground">/ 5.0</span>
        </div>
        <Progress
          value={(Number(overallGPA.toFixed(2)) / 5) * 100}
          className="mt-3 h-2"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Target: {targetGpa.toFixed(1)}
        </p>
      </CardContent>
      <CardFooter className="space-x-4">
        <Link href={"/dashboard/transcript"}>
          <Button>
            Transcript
            <GoArrowUpRight className="h-4 w-4" />
          </Button>
        </Link>

        <Link href={"/dashboard/quick-calculate"}>
          <Button className="bg-foreground text-background hover:bg-foreground/80">
            Quick
            <MdCalculate className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CpaCard;
