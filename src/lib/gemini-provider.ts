// --------------------------------------------------------------------------
// Gemini Provider — Multi-Key Orchestrator
// --------------------------------------------------------------------------
// Manages a pool of Gemini API keys with automatic failover.
//
// - Keys are discovered ONCE at startup from GEMINI_API_KEY_* env vars.
// - Requests are tried sequentially across keys with exponential backoff.
// - Non-retryable errors (400, safety, schema) bubble up immediately.
// - User-provided keys get a single attempt — never fall back to server keys.
// - API keys are NEVER logged or persisted.
// --------------------------------------------------------------------------

import { GoogleGenAI } from "@google/genai";
import { createGeminiClient } from "./gemini";
import { logger } from "./logger";
import { env } from "./env";
import {
  AllGeminiKeysFailedError,
  UserGeminiApiError,
  type UserGeminiApiErrorReason,
} from "./errors";

const SERVICE = "GeminiProvider";

// ─── Types ───────────────────────────────────────────────────────────────

interface ServerKey {
  envName: string;
  client: GoogleGenAI;
}

export interface GeminiRequestConfig {
  /** Model name. Defaults to env.GEMINI_MODEL */
  model?: string;
  /** The user prompt content */
  contents: string;
  /** System instruction for the model */
  systemInstruction: string;
  /** Sampling temperature */
  temperature?: number;
  /** Response MIME type (e.g. "application/json") */
  responseMimeType?: string;
  /** Optional user-provided API key — single attempt, never persisted */
  userApiKey?: string;
}

export interface GeminiResponse {
  text: string | undefined;
  usageMetadata: unknown;
}

// ─── Backoff ─────────────────────────────────────────────────────────────

const BASE_DELAY_MS = 200;
const MAX_DELAY_MS = 800;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getBackoffDelay(attemptIndex: number): number {
  return Math.min(BASE_DELAY_MS * Math.pow(2, attemptIndex), MAX_DELAY_MS);
}

// ─── Error Classification ────────────────────────────────────────────────

/**
 * Determines if an error is retryable (worth failing over to the next key).
 * Checks structured fields first, string matching as fallback.
 */
function isRetryableError(error: unknown): boolean {
  if (error && typeof error === "object") {
    // Check structured status code if exposed by the SDK
    const statusCode =
      (error as Record<string, unknown>).status ??
      (error as Record<string, unknown>).statusCode ??
      (error as Record<string, unknown>).httpStatusCode;

    if (typeof statusCode === "number") {
      if (statusCode === 429 || statusCode >= 500) return true;
      if (statusCode === 400 || statusCode === 401 || statusCode === 403)
        return false;
    }

    // Check error code field
    const code = (error as Record<string, unknown>).code;
    if (typeof code === "string") {
      const retryableCodes = [
        "RESOURCE_EXHAUSTED",
        "UNAVAILABLE",
        "INTERNAL",
        "DEADLINE_EXCEEDED",
      ];
      if (retryableCodes.includes(code)) return true;

      const nonRetryableCodes = [
        "INVALID_ARGUMENT",
        "PERMISSION_DENIED",
        "UNAUTHENTICATED",
        "NOT_FOUND",
      ];
      if (nonRetryableCodes.includes(code)) return false;
    }
  }

  // Fallback: string matching on message
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (
      msg.includes("429") ||
      msg.includes("quota") ||
      msg.includes("rate limit") ||
      msg.includes("resource_exhausted")
    )
      return true;
    if (
      msg.includes("500") ||
      msg.includes("502") ||
      msg.includes("503") ||
      msg.includes("internal")
    )
      return true;
    if (
      msg.includes("timeout") ||
      msg.includes("econnreset") ||
      msg.includes("econnrefused") ||
      msg.includes("network") ||
      msg.includes("unavailable")
    )
      return true;
  }

  return false;
}

/**
 * Classifies a user API key error into a specific reason.
 * Checks structured SDK fields first, string matching as fallback.
 */
function classifyUserKeyError(error: unknown): UserGeminiApiErrorReason {
  if (error && typeof error === "object") {
    const statusCode =
      (error as Record<string, unknown>).status ??
      (error as Record<string, unknown>).statusCode ??
      (error as Record<string, unknown>).httpStatusCode;

    if (typeof statusCode === "number") {
      if (statusCode === 401 || statusCode === 403) return "invalid_key";
      if (statusCode === 429) return "quota_exceeded";
      if (statusCode >= 500) return "service_unavailable";
    }

    const code = (error as Record<string, unknown>).code;
    if (typeof code === "string") {
      if (code === "PERMISSION_DENIED" || code === "UNAUTHENTICATED")
        return "invalid_key";
      if (code === "RESOURCE_EXHAUSTED") return "quota_exceeded";
      if (code === "UNAVAILABLE" || code === "INTERNAL")
        return "service_unavailable";
    }
  }

  // Fallback: string matching
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (
      msg.includes("api_key_invalid") ||
      msg.includes("permission_denied") ||
      msg.includes("401") ||
      msg.includes("403") ||
      msg.includes("invalid api key") ||
      msg.includes("unauthenticated")
    )
      return "invalid_key";
    if (msg.includes("429") || msg.includes("quota") || msg.includes("rate limit"))
      return "quota_exceeded";
    if (
      msg.includes("503") ||
      msg.includes("timeout") ||
      msg.includes("unavailable")
    )
      return "service_unavailable";
  }

  return "unknown";
}

// ─── Key Discovery (runs ONCE at module load) ────────────────────────────

function discoverServerKeys(): ServerKey[] {
  const keys = Object.keys(process.env)
    .filter((key) => /^GEMINI_API_KEY_\d+$/.test(key))
    .sort()
    .map((envName) => {
      const apiKey = process.env[envName];
      if (!apiKey || apiKey.trim().length === 0) return null;
      return { envName, client: createGeminiClient(apiKey.trim()) };
    })
    .filter((entry): entry is ServerKey => entry !== null);

  logger.info(SERVICE, `Discovered ${keys.length} server API key(s)`, {
    keys: keys.map((k) => k.envName),
  });

  return keys;
}

const serverKeys = discoverServerKeys();

// ─── Request Execution ──────────────────────────────────────────────────

async function executeRequest(
  client: GoogleGenAI,
  config: GeminiRequestConfig
): Promise<GeminiResponse> {
  const model = config.model || env.GEMINI_MODEL;

  const response = await client.models.generateContent({
    model,
    contents: config.contents,
    config: {
      systemInstruction: config.systemInstruction,
      temperature: config.temperature ?? 0.2,
      responseMimeType: config.responseMimeType ?? "application/json",
    },
  });

  return {
    text: response.text,
    usageMetadata: response.usageMetadata,
  };
}

// ─── Public API ─────────────────────────────────────────────────────────

/**
 * Execute a Gemini request with automatic API key failover.
 *
 * If `config.userApiKey` is provided:
 *   → Single attempt with that key only.
 *   → On failure, throws UserGeminiApiError with a classified reason.
 *   → NEVER falls back to server keys.
 *
 * Otherwise:
 *   → Tries each server key sequentially with exponential backoff.
 *   → Non-retryable errors bubble up immediately.
 *   → If all keys fail, throws AllGeminiKeysFailedError.
 */
async function executeWithFailover(
  config: GeminiRequestConfig
): Promise<GeminiResponse> {
  // ── User Key Path ──────────────────────────────────────────────────
  if (config.userApiKey) {
    logger.info(SERVICE, "Using temporary user Gemini key");

    const client = createGeminiClient(config.userApiKey.trim());

    try {
      const response = await executeRequest(client, config);
      logger.info(SERVICE, "User key request succeeded");
      return response;
    } catch (error) {
      const reason = classifyUserKeyError(error);
      const originalMessage =
        error instanceof Error ? error.message : String(error);

      logger.warn(SERVICE, "User key request failed", {
        reason,
        // Never log the actual key
      });

      throw new UserGeminiApiError(reason, originalMessage);
    }
  }

  // ── Server Key Path ────────────────────────────────────────────────
  if (serverKeys.length === 0) {
    throw new AllGeminiKeysFailedError(0);
  }

  let lastError: Error | null = null;

  for (let i = 0; i < serverKeys.length; i++) {
    const { envName, client } = serverKeys[i];
    const attemptNum = i + 1;

    try {
      logger.info(SERVICE, `Attempt ${attemptNum}/${serverKeys.length}`, {
        key: envName,
      });

      const response = await executeRequest(client, config);

      logger.info(SERVICE, `Attempt ${attemptNum}/${serverKeys.length} succeeded`, {
        key: envName,
      });

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Non-retryable errors bubble up immediately — no failover
      if (!isRetryableError(error)) {
        logger.error(
          SERVICE,
          `Non-retryable error on ${envName}. Not failing over.`,
          error,
          { key: envName, attemptNum }
        );
        throw error;
      }

      // Retryable: log and failover
      logger.warn(
        SERVICE,
        `Attempt ${attemptNum}/${serverKeys.length} failed on ${envName}. Failing over...`,
        {
          key: envName,
          errorMessage: lastError.message,
        }
      );

      // Apply exponential backoff before trying the next key
      if (i < serverKeys.length - 1) {
        const delay = getBackoffDelay(i);
        logger.info(SERVICE, `Backoff: ${delay}ms`);
        await sleep(delay);
      }
    }
  }

  // All server keys exhausted
  logger.error(SERVICE, "All server Gemini keys exhausted", lastError, {
    totalKeys: serverKeys.length,
  });

  throw new AllGeminiKeysFailedError(serverKeys.length);
}

// ─── Exported Singleton ─────────────────────────────────────────────────

export const geminiProvider = {
  executeWithFailover,

  /** Returns the count of configured server keys (for diagnostics) */
  getKeyCount(): number {
    return serverKeys.length;
  },
};
