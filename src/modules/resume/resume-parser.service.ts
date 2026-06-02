// --------------------------------------------------------------------------
// Resume Parser Service
// --------------------------------------------------------------------------
// Extracts plain text from a PDF buffer using pdf-parse or DOCX using mammoth.
// Never sends binary anywhere — only the extracted text leaves this module.
// --------------------------------------------------------------------------

import { ResumeParseError } from "@/src/lib/errors";
import { logger } from "@/src/lib/logger";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdf = require("pdf-parse/lib/pdf-parse.js");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mammoth = require("mammoth");
import type { ResumeParseResult } from "./resume.types";
import type { OnProgressCallback } from "../generation/generation.types";

const SERVICE = "ResumeParser";
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Parse a PDF or DOCX buffer and extract plain text.
 *
 * @param buffer - Raw PDF or DOCX file bytes
 * @param fileName - Original file name (for logging)
 * @returns Extracted text and page count
 * @throws ResumeParseError if parsing fails
 */
export async function parseResume(
  buffer: Buffer,
  fileName?: string,
  onProgress?: OnProgressCallback
): Promise<ResumeParseResult> {
  await onProgress?.(`Upload received: ${fileName || "document"}`, "Upload received", 30);
  logger.info(SERVICE, `Parsing resume...`, {
    fileName: fileName ?? "unknown",
    sizeBytes: buffer.length,
  });
  logger.time(`resume-parse-${fileName}`);

  // Validate file size
  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    throw new ResumeParseError(
      `Resume file too large: ${(buffer.length / 1024 / 1024).toFixed(1)}MB (max ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB)`,
      { sizeBytes: buffer.length, maxBytes: MAX_FILE_SIZE_BYTES }
    );
  }

  if (buffer.length === 0) {
    throw new ResumeParseError("Resume file is empty", {
      fileName: fileName ?? "unknown",
    });
  }

  const isDocx = fileName?.toLowerCase().endsWith(".docx");

  try {
    let text = "";
    let numpages = 1;

    if (isDocx) {
      await onProgress?.("Detected DOCX, extracting text...", "Parsing DOCX", 40);
      // Parse DOCX with Mammoth
      const result = await mammoth.extractRawText({ buffer });
      text = result.value.trim();
    } else {
      await onProgress?.("Detected PDF, extracting text...", "Parsing PDF", 40);
      // Parse PDF
      // Note: pdf-parse sometimes warns about missing fonts or maps.
      // We suppress console output globally during this call if needed,
      // but native pdf-parse logs are usually on stderr.
      const data = await pdf(buffer, {
        max: 0, // no limit
      });
      text = data.text;
      numpages = data.numpages;
    }

    const cleanedText = text
      .replace(/\n+/g, "\n")
      .replace(/\s+/g, " ")
      .trim();

    await onProgress?.(`Extracted ${cleanedText.length.toLocaleString()} characters of text.`, "Extracting text", 50);

    if (!cleanedText || cleanedText.length < 50) {
      throw new ResumeParseError(
        "Resume appears to contain no readable text. It may be a scanned image.",
        { extractedLength: text?.length ?? 0, fileName: fileName ?? "unknown" }
      );
    }

    logger.timeEnd(SERVICE, `resume-parse-${fileName}`);
    logger.info(SERVICE, `Parsed successfully`, {
      pages: numpages,
      textLength: text.length,
      type: isDocx ? "docx" : "pdf",
    });

    return {
      text,
      pageCount: numpages,
    };
  } catch (error) {
    logger.timeEnd(SERVICE, `resume-parse-${fileName}`);

    if (error instanceof ResumeParseError) {
      throw error;
    }

    throw new ResumeParseError(
      `Failed to parse resume file: ${error instanceof Error ? error.message : String(error)}`,
      { fileName: fileName ?? "unknown" }
    );
  }
}
