import { eq, inArray } from "drizzle-orm";
import { db } from "./db";
import { adminConfigs } from "../shared/schema";

export async function loadAdminConfigKeys(keys: string[]): Promise<Record<string, string>> {
  const dbValues: Record<string, string> = {};
  if (keys.length === 0) return dbValues;

  try {
    const rows = await db
      .select()
      .from(adminConfigs)
      .where(inArray(adminConfigs.configKey, keys));
    for (const row of rows) {
      if (row.configValue) dbValues[row.configKey] = row.configValue;
    }
  } catch (err) {
    console.error("Failed to load admin config:", err);
  }

  return dbValues;
}

export async function upsertAdminConfig(
  key: string,
  value: string,
  options: { isSecret?: boolean; description?: string; updatedBy?: number } = {},
) {
  const existing = await db
    .select()
    .from(adminConfigs)
    .where(eq(adminConfigs.configKey, key))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(adminConfigs)
      .set({
        configValue: value,
        updatedAt: new Date(),
        updatedBy: options.updatedBy,
        isSecret: options.isSecret ?? existing[0].isSecret,
      })
      .where(eq(adminConfigs.configKey, key));
  } else {
    await db.insert(adminConfigs).values({
      configKey: key,
      configValue: value,
      isSecret: options.isSecret ?? false,
      description: options.description,
      updatedBy: options.updatedBy,
    });
  }
}

export async function saveAdminConfigKeys(
  body: Record<string, unknown>,
  allowedKeys: string[],
  secretKeys: string[],
  userId?: number,
) {
  for (const [key, value] of Object.entries(body)) {
    if (!allowedKeys.includes(key)) continue;
    if (secretKeys.includes(key) && (value === "(configured)" || value === "")) continue;
    await upsertAdminConfig(key, String(value), {
      isSecret: secretKeys.includes(key),
      updatedBy: userId,
    });
  }
}

export function maskSecret(value: string | undefined, configured: boolean) {
  return configured ? "(configured)" : "";
}

export function configSource(hasDb: boolean, hasEnv: boolean): "admin_panel" | "environment" | "none" {
  if (hasDb) return "admin_panel";
  if (hasEnv) return "environment";
  return "none";
}
