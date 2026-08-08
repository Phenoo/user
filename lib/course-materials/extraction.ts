import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

function stripHtml(input: string) {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeExtractedText(input: string) {
  return input.replace(/\u0000/g, " ").replace(/\s+\n/g, "\n").trim();
}

async function extractWithTextutil(filePath: string) {
  const { stdout } = await execFileAsync("/usr/bin/textutil", [
    "-convert",
    "txt",
    "-stdout",
    filePath,
  ]);

  return normalizeExtractedText(stdout);
}

async function extractPdfText(filePath: string) {
  try {
    const { stdout } = await execFileAsync("/usr/bin/mdls", [
      "-raw",
      "-name",
      "kMDItemTextContent",
      filePath,
    ]);

    const normalized = normalizeExtractedText(stdout);

    if (normalized && normalized !== "(null)") {
      return normalized;
    }
  } catch (error) {
    console.warn("[course-materials] mdls PDF extraction failed:", error);
  }

  const { stdout } = await execFileAsync("/usr/bin/strings", ["-n", "8", filePath]);
  return normalizeExtractedText(stdout);
}

export async function extractTextFromUploadedFile(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileExtension = path.extname(file.name).toLowerCase();
  const filePath = path.join(
    os.tmpdir(),
    `studentapp-upload-${Date.now()}-${Math.random().toString(36).slice(2)}${fileExtension}`
  );

  await fs.writeFile(filePath, buffer);

  try {
    if (
      file.type.startsWith("text/") ||
      [".md", ".txt", ".csv", ".json"].includes(fileExtension)
    ) {
      const raw = buffer.toString("utf8");
      return normalizeExtractedText(
        file.type.includes("html") || fileExtension === ".html"
          ? stripHtml(raw)
          : raw
      );
    }

    if ([".rtf", ".doc", ".docx", ".odt", ".html"].includes(fileExtension)) {
      return await extractWithTextutil(filePath);
    }

    if (file.type === "application/pdf" || fileExtension === ".pdf") {
      return await extractPdfText(filePath);
    }

    try {
      return await extractWithTextutil(filePath);
    } catch {
      throw new Error(
        `StudentApp could not extract text from ${file.name}. Supported formats currently include text, markdown, PDF, RTF, DOC, and DOCX.`
      );
    }
  } finally {
    await fs.unlink(filePath).catch(() => undefined);
  }
}
