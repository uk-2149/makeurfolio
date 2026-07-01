import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  GITHUB_TOKEN: z.string().min(1, "GITHUB_TOKEN is required"),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const formatted = parsed.error.issues
      .map((issue) => `  ✗ ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    console.error(
      `\n❌ Environment validation failed:\n${formatted}\n\nPlease check your .env file.\n`
    );
    throw new Error("Environment validation failed");
  }

  // Verify at least one GEMINI_API_KEY_* is configured
  const geminiKeys = Object.keys(process.env).filter((key) =>
    /^GEMINI_API_KEY_\d+$/.test(key)
  );
  if (geminiKeys.length === 0) {
    console.error(
      "\n❌ No GEMINI_API_KEY_* environment variables found.\n" +
        "   Configure at least one (e.g. GEMINI_API_KEY_1) in your .env file.\n"
    );
    throw new Error(
      "No GEMINI_API_KEY_* environment variables configured"
    );
  }

  return parsed.data;
}

export const env = validateEnv();
