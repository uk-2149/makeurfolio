// --------------------------------------------------------------------------
// Typed Error Hierarchy
// --------------------------------------------------------------------------
// Every service throws a specific error subclass. Route handlers catch these
// and translate to appropriate HTTP responses. Never throw generic Error.
// --------------------------------------------------------------------------

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly context: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_ERROR",
    context: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.context = context;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public toJSON(): Record<string, unknown> {
    return {
      error: this.code,
      message: this.message,
      statusCode: this.statusCode,
      ...(Object.keys(this.context).length > 0 ? { context: this.context } : {}),
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, 400, "VALIDATION_ERROR", context);
  }
}

export class GithubError extends AppError {
  constructor(
    message: string,
    statusCode: number = 502,
    context: Record<string, unknown> = {}
  ) {
    super(message, statusCode, "GITHUB_ERROR", context);
  }
}

export class GeminiError extends AppError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, 502, "GEMINI_ERROR", context);
  }
}

export class ResumeParseError extends AppError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, 422, "RESUME_PARSE_ERROR", context);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, identifier: string) {
    super(`${resource} not found: ${identifier}`, 404, "NOT_FOUND", {
      resource,
      identifier,
    });
  }
}

// --------------------------------------------------------------------------
// Gemini Provider Errors
// --------------------------------------------------------------------------

export class GeminiQuotaExceededError extends AppError {
  constructor(keyName: string) {
    super(
      `Gemini API quota exceeded for ${keyName}`,
      429,
      "GEMINI_QUOTA_EXCEEDED",
      { keyName }
    );
  }
}

export class GeminiFailoverError extends AppError {
  constructor(keyName: string, reason: string) {
    super(
      `Gemini API key ${keyName} failed: ${reason}. Failing over...`,
      502,
      "GEMINI_FAILOVER_ERROR",
      { keyName, reason }
    );
  }
}

export type UserGeminiApiErrorReason =
  | "invalid_key"
  | "quota_exceeded"
  | "service_unavailable"
  | "unknown";

export class UserGeminiApiError extends AppError {
  public readonly reason: UserGeminiApiErrorReason;

  constructor(reason: UserGeminiApiErrorReason, originalMessage: string) {
    const statusMap: Record<UserGeminiApiErrorReason, number> = {
      invalid_key: 400,
      quota_exceeded: 429,
      service_unavailable: 503,
      unknown: 502,
    };
    const messageMap: Record<UserGeminiApiErrorReason, string> = {
      invalid_key: "The API key you provided is invalid. Please check and try again.",
      quota_exceeded: "Your API key has exceeded its quota.",
      service_unavailable: "Gemini is temporarily unavailable. Please try again later.",
      unknown: `Gemini request failed: ${originalMessage}`,
    };

    super(messageMap[reason], statusMap[reason], "USER_GEMINI_API_ERROR", {
      reason,
    });
    this.reason = reason;
  }
}

export class AllGeminiKeysFailedError extends AppError {
  constructor(attemptCount: number) {
    super(
      `All ${attemptCount} server Gemini API keys have been exhausted.`,
      503,
      "ALL_GEMINI_KEYS_EXHAUSTED",
      { attemptCount }
    );
  }
}
