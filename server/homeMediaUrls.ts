import type { Request } from "express";
import { absolutizeUrl } from "./mediaUrl";

/** Resolve a stored media path to an absolute URL for web + mobile clients. */
export function absMedia(req: Request, url?: string | null): string | null {
  return absolutizeUrl(req, url);
}

function absFields<T extends Record<string, unknown>>(
  req: Request,
  item: T,
  keys: string[],
): T {
  const out = { ...item };
  for (const key of keys) {
    const val = out[key];
    if (typeof val === "string" && val.trim()) {
      (out as Record<string, unknown>)[key] = absMedia(req, val);
    }
  }
  return out;
}

export function normalizeHomeContentItem(req: Request, item: Record<string, unknown>) {
  return absFields(req, item, ["media_url", "thumbnail_url"]);
}

export function normalizeHomePayload(req: Request, data: Record<string, unknown>) {
  const sectionKeys = [
    "expert_corner",
    "tips_tricks",
    "equipments",
    "fertilizer_herbicide",
    "soil_water",
    "insects_disease",
    "products",
  ] as const;

  const normalized: Record<string, unknown> = { ...data };

  for (const key of sectionKeys) {
    const items = data[key];
    if (Array.isArray(items)) {
      normalized[key] = items.map((item) =>
        normalizeHomeContentItem(req, item as Record<string, unknown>),
      );
    }
  }

  if (Array.isArray(data.banners)) {
    normalized.banners = data.banners.map((b) =>
      absFields(req, b as Record<string, unknown>, ["image_url"]),
    );
  }

  if (Array.isArray(data.deals)) {
    normalized.deals = data.deals.map((d) =>
      absFields(req, d as Record<string, unknown>, ["image_url"]),
    );
  }

  if (Array.isArray(data.calenders)) {
    normalized.calenders = (data.calenders as Record<string, unknown>[]).map((c) => {
      const cal = absFields(req, c, ["image_url"]);
      if (Array.isArray(cal.week_events)) {
        cal.week_events = (cal.week_events as Record<string, unknown>[]).map((ev) =>
          absFields(req, ev, ["image_url"]),
        );
      }
      if (Array.isArray(cal.plans)) {
        cal.plans = (cal.plans as Record<string, unknown>[]).map((p) =>
          absFields(req, p, ["pdf_url"]),
        );
      }
      return cal;
    });
  }

  if (Array.isArray(data.self_diagnosis)) {
    normalized.self_diagnosis = data.self_diagnosis.map((d) =>
      absFields(req, d as Record<string, unknown>, ["image_url"]),
    );
  }

  if (Array.isArray(data.lawn_library)) {
    normalized.lawn_library = data.lawn_library.map((e) =>
      absFields(req, e as Record<string, unknown>, ["image_url", "download_url"]),
    );
  }

  if (Array.isArray(data.videos)) {
    normalized.videos = (data.videos as Record<string, unknown>[]).map((v) => {
      const title = (v.title ?? v.name ?? "Video lesson") as string;
      const normalizedVideo = absFields(
        req,
        {
          ...v,
          type: v.type ?? "video",
          name: v.name ?? title,
          title,
          media_url: v.media_url ?? v.video_url ?? null,
        },
        ["media_url", "video_url", "thumbnail_url"],
      );
      return normalizedVideo;
    });
  }

  if (data.active_competition && typeof data.active_competition === "object") {
    normalized.active_competition = data.active_competition;
  }

  return normalized;
}

export function normalizeLandingMedia(
  req: Request,
  settings: Record<string, unknown>,
): Record<string, unknown> {
  return absFields(req, settings, ["logoUrl", "heroImage", "heroImage2"]);
}
