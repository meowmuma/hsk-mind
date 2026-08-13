import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1),
  WEB_ORIGIN: z.string().url().default("http://localhost:3000"),
  AUTH_COOKIE_SECURE: z.coerce.boolean().default(false),
  SESSION_SECRET: z.string().min(16),
});

export type AppEnv = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): AppEnv {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success)
    throw new Error(
      `Invalid environment configuration: ${parsed.error.message}`,
    );
  return parsed.data;
}
