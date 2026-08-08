import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { createDeterministicEmbedding, cosineSimilarity } from "../lib/ai/retrieval/embeddings";

function normalizeText(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(input: string) {
  return normalizeText(input)
    .split(" ")
    .filter((token) => token.length >= 3);
}

function estimateTokenCount(content: string) {
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).length * 1.3));
}

function extractKeywords(content: string) {
  const counts = new Map<string, number>();

  for (const token of tokenize(content)) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([token]) => token);
}

function buildChunks(content: string) {
  const paragraphs = content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let currentChunk = "";

  for (const paragraph of paragraphs) {
    if ((currentChunk + "\n\n" + paragraph).length <= 1200) {
      currentChunk = currentChunk
        ? `${currentChunk}\n\n${paragraph}`
        : paragraph;
      continue;
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    if (paragraph.length <= 1200) {
      currentChunk = paragraph;
      continue;
    }

    for (let start = 0; start < paragraph.length; start += 1000) {
      const slice = paragraph.slice(start, start + 1200).trim();
      if (slice) {
        chunks.push(slice);
      }
    }

    currentChunk = "";
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

function scoreChunk(content: string, query: string, keywords: string[] = []) {
  const queryTokens = tokenize(query);
  const contentText = normalizeText(content);
  const keywordSet = new Set(keywords);

  let score = 0;

  for (const token of queryTokens) {
    if (contentText.includes(token)) {
      score += 2;
    }

    if (keywordSet.has(token)) {
      score += 1;
    }
  }

  if (contentText.includes(normalizeText(query))) {
    score += 4;
  }

  return score;
}

function scoreDocumentTitle(title: string, query: string) {
  const normalizedTitle = normalizeText(title);
  const queryTokens = tokenize(query);

  return queryTokens.reduce((score, token) => {
    return normalizedTitle.includes(token) ? score + 1.5 : score;
  }, 0);
}

async function assertCourseAccess(ctx: any, userId: any, courseId: any) {
  const course = await ctx.db.get(courseId);

  if (!course || course.userId !== userId) {
    throw new ConvexError("Course not found or unauthorized access");
  }

  return course;
}

async function assertMaterialAccess(ctx: any, userId: any, materialId: any) {
  const material = await ctx.db.get(materialId);

  if (!material) {
    throw new ConvexError("Material not found");
  }

  await assertCourseAccess(ctx, userId, material.courseId);

  if (material.userId !== userId) {
    throw new ConvexError("Unauthorized access");
  }

  return material;
}

async function replaceChunks(
  ctx: any,
  {
    userId,
    courseId,
    documentId,
    content,
    createdAt,
  }: {
    userId: any;
    courseId: any;
    documentId: any;
    content: string;
    createdAt: number;
  }
) {
  const existingChunks = await ctx.db
    .query("documentChunks")
    .withIndex("by_document", (q: any) => q.eq("documentId", documentId))
    .collect();

  await Promise.all(existingChunks.map((chunk: any) => ctx.db.delete(chunk._id)));

  const chunks = buildChunks(content);

  await Promise.all(
    chunks.map((chunkContent, index) =>
      ctx.db.insert("documentChunks", {
        userId,
        courseId,
        documentId,
        content: chunkContent,
        chunkIndex: index,
        tokenCount: estimateTokenCount(chunkContent),
        keywords: extractKeywords(chunkContent),
        embedding: createDeterministicEmbedding(chunkContent),
        createdAt,
      })
    )
  );

  return chunks.length;
}

export const listByCourse = query({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    await assertCourseAccess(ctx, args.userId, args.courseId);

    const materials = await ctx.db
      .query("courseDocuments")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", args.userId).eq("courseId", args.courseId)
      )
      .collect();

    return materials.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const getCourseMaterialSummary = query({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    await assertCourseAccess(ctx, args.userId, args.courseId);

    const materials = await ctx.db
      .query("courseDocuments")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", args.userId).eq("courseId", args.courseId)
      )
      .collect();

    return {
      total: materials.length,
      ready: materials.filter((material) => material.processingStatus === "ready")
        .length,
      processing: materials.filter(
        (material) => material.processingStatus === "processing"
      ).length,
      failed: materials.filter((material) => material.processingStatus === "failed")
        .length,
    };
  },
});

export const createManualMaterial = mutation({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"),
    title: v.string(),
    content: v.string(),
    source: v.optional(
      v.union(
        v.literal("manual-note"),
        v.literal("upload"),
        v.literal("google-drive"),
        v.literal("onedrive"),
        v.literal("google-classroom"),
        v.literal("canvas"),
        v.literal("microsoft-education")
      )
    ),
    fileName: v.optional(v.string()),
    mimeType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertCourseAccess(ctx, args.userId, args.courseId);

    const now = Date.now();
    const content = args.content.trim();

    if (content.length < 40) {
      throw new ConvexError(
        "Material content should be at least 40 characters long."
      );
    }

    const materialId = await ctx.db.insert("courseDocuments", {
      userId: args.userId,
      courseId: args.courseId,
      title: args.title,
      fileName: args.fileName,
      mimeType: args.mimeType || "text/markdown",
      fileSize: content.length,
      source: args.source || "manual-note",
      processingStatus: "processing",
      textContent: content,
      createdAt: now,
      updatedAt: now,
    });

    const chunkCount = await replaceChunks(ctx, {
      userId: args.userId,
      courseId: args.courseId,
      documentId: materialId,
      content,
      createdAt: now,
    });

    await ctx.db.patch(materialId, {
      processingStatus: "ready",
      chunkCount,
      pageCount: 1,
      updatedAt: now,
    });

    return materialId;
  },
});

export const generateUploadUrl = mutation({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    await assertCourseAccess(ctx, args.userId, args.courseId);
    return await ctx.storage.generateUploadUrl();
  },
});

export const createUploadedMaterial = mutation({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"),
    title: v.string(),
    fileName: v.string(),
    mimeType: v.string(),
    fileSize: v.number(),
    storageId: v.id("_storage"),
    extractedText: v.string(),
  },
  handler: async (ctx, args) => {
    await assertCourseAccess(ctx, args.userId, args.courseId);

    const now = Date.now();
    const normalizedContent = args.extractedText.trim();

    if (normalizedContent.length < 40) {
      throw new ConvexError(
        "StudentApp could not extract enough text from that file to build course knowledge."
      );
    }

    const materialId = await ctx.db.insert("courseDocuments", {
      userId: args.userId,
      courseId: args.courseId,
      title: args.title,
      fileName: args.fileName,
      mimeType: args.mimeType,
      fileSize: args.fileSize,
      storageId: args.storageId,
      source: "upload",
      processingStatus: "processing",
      textContent: normalizedContent,
      createdAt: now,
      updatedAt: now,
    });

    const chunkCount = await replaceChunks(ctx, {
      userId: args.userId,
      courseId: args.courseId,
      documentId: materialId,
      content: normalizedContent,
      createdAt: now,
    });

    await ctx.db.patch(materialId, {
      processingStatus: "ready",
      processingError: undefined,
      chunkCount,
      pageCount: 1,
      updatedAt: now,
    });

    return materialId;
  },
});

export const updateMaterial = mutation({
  args: {
    userId: v.id("users"),
    materialId: v.id("courseDocuments"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const material = await assertMaterialAccess(ctx, args.userId, args.materialId);
    const now = Date.now();

    const updates: Record<string, any> = {
      updatedAt: now,
    };

    if (args.title) {
      updates.title = args.title;
    }

    if (args.content !== undefined) {
      const content = args.content.trim();

      if (content.length < 40) {
        throw new ConvexError(
          "Material content should be at least 40 characters long."
        );
      }

      const chunkCount = await replaceChunks(ctx, {
        userId: args.userId,
        courseId: material.courseId,
        documentId: material._id,
        content,
        createdAt: now,
      });

      updates.textContent = content;
      updates.fileSize = content.length;
      updates.chunkCount = chunkCount;
      updates.processingStatus = "ready";
      updates.processingError = undefined;
    }

    await ctx.db.patch(material._id, updates);

    return true;
  },
});

export const deleteMaterial = mutation({
  args: {
    userId: v.id("users"),
    materialId: v.id("courseDocuments"),
  },
  handler: async (ctx, args) => {
    const material = await assertMaterialAccess(ctx, args.userId, args.materialId);

    const chunks = await ctx.db
      .query("documentChunks")
      .withIndex("by_document", (q) => q.eq("documentId", material._id))
      .collect();

    await Promise.all(chunks.map((chunk) => ctx.db.delete(chunk._id)));

    if (material.storageId) {
      await ctx.storage.delete(material.storageId);
    }

    await ctx.db.delete(material._id);

    return true;
  },
});

export const getMaterialDownloadUrl = query({
  args: {
    userId: v.id("users"),
    materialId: v.id("courseDocuments"),
  },
  handler: async (ctx, args) => {
    const material = await assertMaterialAccess(ctx, args.userId, args.materialId);

    if (!material.storageId) {
      return null;
    }

    return await ctx.storage.getUrl(material.storageId);
  },
});

export const retrieveCourseContext = query({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const startedAt = Date.now();
    await assertCourseAccess(ctx, args.userId, args.courseId);

    const limit = Math.max(1, Math.min(args.limit ?? 5, 8));
    const queryEmbedding = createDeterministicEmbedding(args.query);
    const chunks = await ctx.db
      .query("documentChunks")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", args.userId).eq("courseId", args.courseId)
      )
      .collect();

    const ranked = (
      await Promise.all(
        chunks.map(async (chunk) => {
          const keywordScore = scoreChunk(
            chunk.content,
            args.query,
            chunk.keywords || []
          );
          const vectorScore = cosineSimilarity(
            chunk.embedding || [],
            queryEmbedding
          );

          const document = await ctx.db.get(chunk.documentId);

          if (!document) {
            return null;
          }

          const titleScore = scoreDocumentTitle(document.title, args.query);
          const score = keywordScore + titleScore + Math.max(0, vectorScore) * 6;

          if (score <= 0) {
            return null;
          }

          return {
            chunkId: chunk._id,
            documentId: document._id,
            documentTitle: document.title,
            content: chunk.content,
            fileName: document.fileName,
            mimeType: document.mimeType,
            pageNumber: chunk.pageNumber,
            section: chunk.section,
            heading: chunk.heading,
            keywordScore,
            vectorScore,
            relevanceScore: score,
          };
        })
      )
    )
      .filter(Boolean)
      .sort((a: any, b: any) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);

    return {
      chunks: ranked,
      sources: ranked.map((item: any) => ({
        documentId: item.documentId,
        documentTitle: item.documentTitle,
        fileName: item.fileName,
        mimeType: item.mimeType,
        pageNumber: item.pageNumber,
        section: item.section,
        relevanceScore: item.relevanceScore,
      })),
      retrievalMetadata: {
        query: args.query,
        strategy: "hybrid-keyword-vector",
        totalCandidates: chunks.length,
        returned: ranked.length,
        latencyMs: Date.now() - startedAt,
      },
    };
  },
});
