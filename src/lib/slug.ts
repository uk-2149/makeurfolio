export const RESERVED_SLUGS = [
  "admin",
  "dashboard",
  "login",
  "signup",
  "auth",
  "api",
  "blog",
  "pricing",
  "settings",
  "editor",
  "themes",
  "support",
  "contact",
  "about",
  "privacy",
  "terms",
  "legal",
  "help",
  "faq",
  "status",
  "billing",
  "account",
  "profile",
  "portfolio",
  "makeurfolio",
  "new",
  "register",
  "app",
];

export type SlugStatus = "valid" | "invalid" | "reserved";

export interface SlugValidationResult {
  status: SlugStatus;
  message?: string;
}

/**
 * Normalizes a string to be used as a slug.
 * It gently lowercases and replaces spaces with hyphens.
 * It does NOT strip invalid characters (like @, #) so that
 * the validation function can fail loudly and inform the user why.
 */
export function normalizeSlug(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, "-");
}

/**
 * Validates a slug against our strict rules.
 * Rules:
 * - 3 to 40 characters
 * - Only lowercase letters, numbers, and hyphens
 * - Cannot start or end with a hyphen
 * - No consecutive hyphens
 */
export function validateSlug(slug: string): SlugValidationResult {
  if (slug.length < 3) {
    return {
      status: "invalid",
      message: "Slug must be at least 3 characters long.",
    };
  }

  if (slug.length > 40) {
    return {
      status: "invalid",
      message: "Slug cannot exceed 40 characters.",
    };
  }

  if (RESERVED_SLUGS.includes(slug)) {
    return {
      status: "reserved",
      message: "This slug is reserved and cannot be used.",
    };
  }

  if (slug.startsWith("-") || slug.endsWith("-")) {
    return {
      status: "invalid",
      message: "Slug cannot start or end with a hyphen.",
    };
  }

  if (slug.includes("--")) {
    return {
      status: "invalid",
      message: "Slug cannot contain consecutive hyphens.",
    };
  }

  // Check for invalid characters
  const validRegex = /^[a-z0-9-]+$/;
  if (!validRegex.test(slug)) {
    return {
      status: "invalid",
      message: "Only lowercase letters, numbers, and hyphens are allowed.",
    };
  }

  return { status: "valid" };
}
