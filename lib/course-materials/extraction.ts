import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import zlib from "node:zlib";

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
  return input
    .replace(/\u0000/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/ +/g, " ")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();
}

/**
 * Pure Node.js PDF stream text decoder.
 * Decompresses PDF FlateDecode streams and extracts font strings.
 */
function extractPdfTextPure(buffer: Buffer): string {
  const textChunks: string[] = [];
  const content = buffer.toString("binary");
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match: RegExpExecArray | null;

  while ((match = streamRegex.exec(content)) !== null) {
    const rawStream = Buffer.from(match[1], "binary");
    let decompressed = "";

    try {
      decompressed = zlib.inflateSync(rawStream).toString("utf8");
    } catch {
      try {
        decompressed = zlib.unzipSync(rawStream).toString("utf8");
      } catch {
        decompressed = rawStream.toString("latin1");
      }
    }

    if (decompressed && decompressed.length > 0) {
      // Look for standard PDF text operators (Tj, TJ, ', ")
      const textMatches = decompressed.match(/\(([^)]+)\)\s*(?:Tj|'|")|\[([^\]]+)\]\s*TJ/g);
      if (textMatches) {
        for (const tm of textMatches) {
          const cleaned = tm
            .replace(/\\([()\\])/g, "$1")
            .replace(/\(([^)]*)\)/g, "$1 ")
            .replace(/\[|\]|Tj|TJ|'|"/g, "")
            .trim();
          if (cleaned.length > 0) {
            textChunks.push(cleaned);
          }
        }
      }
    }
  }

  return textChunks.join(" ");
}

async function extractWithTextutil(filePath: string) {
  try {
    const { stdout } = await execFileAsync("/usr/bin/textutil", [
      "-convert",
      "txt",
      "-stdout",
      filePath,
    ]);
    return normalizeExtractedText(stdout);
  } catch {
    return "";
  }
}

async function extractPdfText(filePath: string, buffer: Buffer) {
  // 1. Try unpdf (web-standard Node.js PDF text extractor without worker dependencies)
  try {
    const { extractText } = await import("unpdf");
    const result = await extractText(new Uint8Array(buffer));
    const fullText = Array.isArray(result.text)
      ? result.text.join("\n")
      : (result.text as string) || "";
    if (fullText && fullText.trim().length > 20) {
      return normalizeExtractedText(fullText);
    }
  } catch (unpdfErr) {
    console.warn("[extraction] unpdf extraction warning:", unpdfErr);
  }

  // 2. Try pure stream extraction
  try {
    const pureText = extractPdfTextPure(buffer);
    if (pureText && pureText.trim().length > 30) {
      return normalizeExtractedText(pureText);
    }
  } catch (err) {
    console.warn("[extraction] Pure PDF stream extraction warning:", err);
  }

  // 3. Try macOS mdls metadata if available
  try {
    const { stdout } = await execFileAsync("/usr/bin/mdls", [
      "-raw",
      "-name",
      "kMDItemTextContent",
      filePath,
    ]);

    const normalized = normalizeExtractedText(stdout);
    if (normalized && normalized !== "(null)" && normalized.length > 20) {
      return normalized;
    }
  } catch {
    // ignore
  }

  // 4. Fallback to strings utility
  try {
    const { stdout } = await execFileAsync("/usr/bin/strings", ["-n", "4", filePath]);
    const normalized = normalizeExtractedText(stdout);
    if (normalized && normalized.length > 20) {
      return normalizeExtractedText(normalized);
    }
  } catch {
    // ignore
  }

  return "";
}

export async function extractTextFromUploadedFile(file: File): Promise<string> {
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
      const text = await extractWithTextutil(filePath);
      if (text) return text;
    }

    if (file.type === "application/pdf" || fileExtension === ".pdf") {
      const text = await extractPdfText(filePath, buffer);
      if (text) return text;
    }

    const fallback = await extractWithTextutil(filePath);
    if (fallback) return fallback;

    return buffer.toString("utf8").replace(/[^\x20-\x7E\n\r\t]/g, " ").trim();
  } finally {
    await fs.unlink(filePath).catch(() => undefined);
  }
}
