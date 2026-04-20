import LlamaCloud from "@llamaindex/llama-cloud";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { tmpdir } from "os";
import fs from "fs";


export type LlamaParsedPage = {
  pageNumber: number;
  text: string;
};

interface RetryOptions {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  baseDelayMs: 500,
  maxDelayMs: 5000,
};

// ---------------- RETRY ----------------

async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = DEFAULT_RETRY_OPTIONS,
  context = "operation"
): Promise<T> {
  const { maxAttempts, baseDelayMs, maxDelayMs } = options;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      const isLast = attempt === maxAttempts;

      if (error instanceof Error && /4\d{2}/.test(error.message)) {
        throw error;
      }

      if (isLast) throw error;

      const delay = Math.min(
        baseDelayMs * 2 ** (attempt - 1),
        maxDelayMs
      );

      console.warn(
        `[Parser] ${context} failed (${attempt}/${maxAttempts}). Retrying in ${delay}ms`
      );

      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw new Error(`${context} failed after retries`);
}

// ---------------- CLEAN TEXT ----------------

function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim();
}

export function shouldParseFile(fileName: string): boolean {
  return fileName.toLowerCase().endsWith(".pdf");
}

// ---------------- MAIN PARSER ----------------

export async function parseWithLlamaParse(
  pdfBuffer: Buffer,
  fileName: string = "document.pdf"
): Promise<LlamaParsedPage[]> {
  const apiKey = process.env.LLAMA_CLOUD_API_KEY;

  if (!apiKey) throw new Error("LLAMA_CLOUD_API_KEY not set");

  if (pdfBuffer.byteLength === 0) throw new Error("Empty file");

  if (pdfBuffer.byteLength > MAX_FILE_SIZE_BYTES)
    throw new Error("File too large");

  const tempFilePath = join(tmpdir(), `temp-${randomUUID()}.pdf`);
  const client = new LlamaCloud({ apiKey });

  try {
    // 1️⃣ Write buffer → temp file
    await writeFile(tempFilePath, pdfBuffer);

    // 2️⃣ Upload file
    const file = await withRetry(
      () =>
        client.files.create({
          file: fs.createReadStream(tempFilePath),
          purpose: "parse",
        }),
      undefined,
      "file upload"
    );

    // 3️⃣ Parse file
    const result = await withRetry(
      () =>
        client.parsing.parse({
          file_id: file.id,
          tier: "agentic",
          version: "latest",
          expand: ["markdown"],
        }),
      undefined,
      "parsing"
    );

    if (!result?.markdown?.pages?.length) {
      throw new Error("No parsed content returned");
    }

    // 4️⃣ Convert to your format
    const pages: LlamaParsedPage[] = result.markdown.pages
      .map((p: any, index: number) => ({
        pageNumber: p.page ?? index + 1,
        text: cleanText(p.markdown || ""),
      }))
      .filter((p) => p.text.length > 0);

    if (pages.length === 0) {
      throw new Error("No usable text extracted");
    }

    return pages;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : String(error);

    const err = new Error(`Parsing failed for ${fileName}: ${message}`);
    (err as Error & { cause?: unknown }).cause = error;

    throw err;
  } finally {
    try {
      await unlink(tempFilePath);
    } catch {
      // ignore cleanup errors
    }
  }
}