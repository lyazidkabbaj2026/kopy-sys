import { z } from "zod";

const envSchema = z.object({
  // Infrastructure
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url(),

  // Apify
  APIFY_API_TOKEN: z.string().min(1),
  APIFY_SCOUT_ACTOR_ID: z.string().default("compass/crawler-google-places"),

  // Groq
  GROQ_API_KEY: z.string().min(1),
  GROQ_MODEL: z.string().default("llama3-8b-8192"),

  // App Defaults
  DEFAULT_CITY: z.string().default("Casablanca"),
  DEFAULT_CATEGORY: z.string().default("Spa"),
  APP_LANGUAGE: z.string().default("fr"),
  BRAND_NAME: z.string().default("NXSURGE"),
});

export const env = envSchema.parse(process.env);

