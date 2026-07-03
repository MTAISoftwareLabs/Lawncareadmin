const SITE_ORIGIN =
  typeof window !== "undefined" ? window.location.origin : "https://thelawncareworkshop.com";

/** Resolve relative media paths to absolute URLs (matches mobile VideoPlayerScreen logic). */
export function resolveMediaUrl(url?: string | null): string | null {
  if (url === null || url === undefined) return null;
  let finalUrl = String(url).trim();
  if (!finalUrl) return null;

  if (finalUrl.startsWith("//")) {
    return `https:${finalUrl}`;
  }
  if (/^https?:\/\//i.test(finalUrl)) {
    return finalUrl;
  }
  if (finalUrl.startsWith("/")) {
    return `${SITE_ORIGIN}${finalUrl}`;
  }
  return `${SITE_ORIGIN}/${finalUrl.replace(/^\//, "")}`;
}

const VIDEO_EXT = /\.(mp4|webm|mov|m4v|avi|mkv|wmv|flv)(\?.*)?$/i;

export function isVideoUrl(url?: string | null): boolean {
  if (!url) return false;
  return VIDEO_EXT.test(url) || url.includes("/objects/") && VIDEO_EXT.test(url);
}
