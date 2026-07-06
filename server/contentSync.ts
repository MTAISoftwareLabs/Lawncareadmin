import { and, asc, eq, like } from "drizzle-orm";
import { db } from "./db";
import { homeContentItems, videoLessons } from "../shared/schema";
import { loadAdminConfigKeys, upsertAdminConfig } from "./adminConfigStore";
import { WEATHER_CONFIG_KEYS } from "./weatherConfig";

function toAbsoluteUrl(path: string | null | undefined, siteBase: string): string | null {
  if (!path?.trim()) return null;
  const value = path.trim();
  if (/^https?:\/\//i.test(value)) return value;
  const base = siteBase.replace(/\/$/, "");
  return `${base}${value.startsWith("/") ? value : `/${value}`}`;
}

/** Replace seed placeholder lesson URLs with real expert_corner videos from CMS. */
export async function syncPlaceholderVideoLessons(): Promise<void> {
  const siteBase = process.env.APP_URL || "https://thelawncareworkshop.com";

  const placeholders = await db
    .select()
    .from(videoLessons)
    .where(and(eq(videoLessons.isActive, true), like(videoLessons.videoUrl, "%example.com%")))
    .orderBy(asc(videoLessons.displayOrder), asc(videoLessons.id));

  if (!placeholders.length) return;

  const expertVideos = await db
    .select()
    .from(homeContentItems)
    .where(
      and(
        eq(homeContentItems.section, "expert_corner"),
        eq(homeContentItems.type, "video"),
        eq(homeContentItems.isActive, true),
      ),
    )
    .orderBy(asc(homeContentItems.displayOrder), asc(homeContentItems.id));

  if (!expertVideos.length) {
    console.log("⚠️ No expert_corner videos found to sync lesson placeholders");
    return;
  }

  const count = Math.min(placeholders.length, expertVideos.length);
  for (let i = 0; i < count; i++) {
    const lesson = placeholders[i];
    const source = expertVideos[i];
    await db
      .update(videoLessons)
      .set({
        title: source.name,
        description: source.description || lesson.description,
        videoUrl: toAbsoluteUrl(source.mediaUrl, siteBase) || lesson.videoUrl,
        thumbnailUrl: toAbsoluteUrl(source.thumbnailUrl, siteBase) || lesson.thumbnailUrl,
      })
      .where(eq(videoLessons.id, lesson.id));
  }

  console.log(`✅ Synced ${count} video lesson(s) from expert_corner content`);
}

/** Ensure weather proxy works when only the mobile app key exists. */
export async function ensureWeatherApiKey(): Promise<void> {
  const existing = await loadAdminConfigKeys([...WEATHER_CONFIG_KEYS]);
  if (existing.weather_api_key?.trim()) return;

  const fromEnv = process.env.WEATHER_API_KEY?.trim();
  if (fromEnv) {
    await upsertAdminConfig("weather_api_key", fromEnv, {
      isSecret: true,
      description: "WeatherAPI.com forecast key",
    });
    console.log("✅ Weather API key loaded from environment");
    return;
  }

  // Same WeatherAPI key used by the Flutter app (server-side proxy for web banners).
  const mobileParityKey = "29fbc9e95a474aa59ad232246251702";
  await upsertAdminConfig("weather_api_key", mobileParityKey, {
    isSecret: true,
    description: "WeatherAPI.com key (mobile parity)",
  });
  console.log("✅ Weather API key configured for web/mobile parity");
}
