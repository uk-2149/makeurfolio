// --------------------------------------------------------------------------
// Generation Context
// --------------------------------------------------------------------------
// A single request-scoped object threaded through the entire generation
// pipeline. Avoids gradually adding optional parameters to every function
// signature. Extend this interface when new cross-cutting concerns emerge
// (e.g. locale, maxTokens, experimentFlags).
// --------------------------------------------------------------------------

export interface GenerationContext {
  /** Request-scoped unique ID for tracing (typically the generation CUID) */
  requestId: string;

  /** Optional user-provided Gemini API key. Memory-only — never persisted. */
  userApiKey?: string;

  /** Model override. Defaults to env.GEMINI_MODEL if not specified. */
  model?: string;
}
