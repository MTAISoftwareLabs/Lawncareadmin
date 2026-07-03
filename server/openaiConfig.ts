import { db } from "./db";
import { adminConfigs } from "../shared/schema";
import { inArray } from "drizzle-orm";

export const OPENAI_CONFIG_KEYS = ["openai_api_key", "openai_base_url"] as const;

export interface OpenAiConfig {
  apiKey?: string;
  baseUrl: string;
}

export async function loadOpenAiConfig(): Promise<OpenAiConfig> {
  const dbValues: Record<string, string> = {};
  try {
    const rows = await db
      .select()
      .from(adminConfigs)
      .where(inArray(adminConfigs.configKey, OPENAI_CONFIG_KEYS as unknown as string[]));
    for (const row of rows) {
      if (row.configValue) dbValues[row.configKey] = row.configValue;
    }
  } catch (err) {
    console.error("Failed to load OpenAI config from DB:", err);
  }

  const apiKey = (dbValues.openai_api_key || process.env.OPENAI_API_KEY || "").trim() || undefined;
  const baseUrl = (
    dbValues.openai_base_url ||
    process.env.OPENAI_BASE_URL ||
    "https://api.openai.com/v1"
  ).replace(/\/$/, "");

  return { apiKey, baseUrl };
}

export async function isOpenAiConfigured(): Promise<boolean> {
  const { apiKey } = await loadOpenAiConfig();
  return !!apiKey;
}
