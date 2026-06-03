import type { Request } from "express";

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|heic|heif|bmp)(\?.*)?$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|m4v|avi|mkv|wmv|flv)(\?.*)?$/i;

/**
 * Build the public base URL (protocol + host) for the current request,
 * honouring reverse-proxy headers used in production (Nginx/PM2 on the VPS,
 * Replit's proxy in dev).
 */
export function getRequestBaseUrl(req: Request): string {
  // Prefer an explicit, trusted public origin when configured. This avoids
  // relying on (spoofable) Host / X-Forwarded-Host headers in production.
  const configured = (process.env.PUBLIC_API_BASE_URL || "").trim();
  if (configured) return configured.replace(/\/+$/, "");

  const proto =
    (req.headers["x-forwarded-proto"] as string)?.split(",")[0].trim() ||
    (req.secure ? "https" : "http");
  const host =
    (req.headers["x-forwarded-host"] as string)?.split(",")[0].trim() ||
    req.headers.host ||
    "";
  return `${proto}://${host}`;
}

/**
 * Turn a relative storage path (e.g. "/objects/chat/x.jpg" or "/uploads/x.jpg")
 * into an absolute URL the mobile app / browser can load. URLs that are already
 * absolute are returned unchanged.
 */
export function absolutizeUrl(
  req: Request,
  url?: string | null
): string | null {
  if (url === null || url === undefined) return null;
  const u = String(url).trim();
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith("/")) return `${getRequestBaseUrl(req)}${u}`;
  return u;
}

/**
 * Detect when a text field is actually just a media path/URL that was sent into
 * the wrong column (so it renders as a clickable link/raw text instead of an
 * image). Plain messages with spaces are treated as real text, never media.
 */
export function looksLikeMediaPath(s?: string | null): boolean {
  if (!s) return false;
  const t = String(s).trim();
  if (!t || /\s/.test(t)) return false;
  const isStoragePath = /^(\/objects\/|\/uploads\/|https?:\/\/)/i.test(t);
  return isStoragePath && (IMAGE_EXT.test(t) || VIDEO_EXT.test(t));
}

export function mediaTypeForPath(s: string): "image" | "video" | "document" {
  if (IMAGE_EXT.test(s)) return "image";
  if (VIDEO_EXT.test(s)) return "video";
  return "document";
}

/**
 * Normalise an Expert Q&A message (text / image_url columns). If the image was
 * mistakenly placed in `text`, move it to `image_url`. Absolutize the result.
 */
export function normalizeQaMessage(
  req: Request,
  m: { text: string | null; image_url: string | null }
): { text: string | null; image_url: string | null } {
  let text = m.text;
  let imageUrl = m.image_url;
  if (!imageUrl && looksLikeMediaPath(text)) {
    imageUrl = text;
    text = null;
  }
  return { text, image_url: absolutizeUrl(req, imageUrl) };
}

/**
 * Normalise a chat/support message that uses (messageType, content, mediaUrl).
 * Handles the case where the media path was sent as `content` with type "text".
 */
export function normalizeChatMessage(
  req: Request,
  m: { messageType: string | null; content: string | null; mediaUrl: string | null }
): { messageType: string; content: string | null; mediaUrl: string | null } {
  let messageType = m.messageType || "text";
  let content = m.content;
  let mediaUrl = m.mediaUrl;

  if (!mediaUrl && looksLikeMediaPath(content)) {
    mediaUrl = content;
    content = null;
  }
  if (mediaUrl && (messageType === "text" || !messageType)) {
    messageType = mediaTypeForPath(mediaUrl);
  }
  return { messageType, content, mediaUrl: absolutizeUrl(req, mediaUrl) };
}
