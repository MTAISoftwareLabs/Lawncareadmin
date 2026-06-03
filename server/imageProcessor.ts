import sharp from "sharp";
import path from "path";

// Don't retain decoded images in memory between requests (keeps RSS bounded on
// the small production VPS where uploads buffer fully in memory).
sharp.cache(false);

// Reject absurdly large images (decompression bombs) before doing the heavy
// decode/encode. 100 megapixels comfortably allows any real phone/camera photo
// while keeping worst-case decode memory bounded on the small VPS.
const MAX_INPUT_PIXELS = 100_000_000;

// Longest-edge cap. Photos from phones are often 4000px+; 1920px keeps them
// sharp on any screen while dramatically cutting file size.
const MAX_DIMENSION = 1920;

// Formats browsers can display natively. If conversion fails, an original in
// one of these is still safe to store; anything else (HEIC/HEIF/BMP/TIFF) is
// not and must be rejected rather than stored as an unrenderable "image".
const BROWSER_RENDERABLE = new Set([
  ".jpeg", ".jpg", ".png", ".webp", ".gif",
]);

export function isBrowserRenderableImage(originalName: string, mimeType: string): boolean {
  const ext = path.extname(originalName).toLowerCase();
  if (BROWSER_RENDERABLE.has(ext)) return true;
  return /^image\/(jpeg|png|webp|gif)$/.test(mimeType);
}

// Raster image types we will re-encode to PNG. GIF is excluded so animation is
// preserved, and SVG is never processed (it isn't a raster image).
const CONVERTIBLE_EXTENSIONS = new Set([
  ".jpeg", ".jpg", ".png", ".webp", ".bmp", ".heic", ".heif", ".tif", ".tiff",
]);

/**
 * Decide whether an uploaded file is a still image we should convert to PNG.
 * Animated GIFs and SVGs are intentionally left untouched.
 */
export function shouldConvertToPng(originalName: string, mimeType: string): boolean {
  const ext = path.extname(originalName).toLowerCase();
  if (mimeType === "image/gif" || ext === ".gif") return false;
  if (mimeType === "image/svg+xml" || ext === ".svg") return false;
  if (CONVERTIBLE_EXTENSIONS.has(ext)) return true;
  return mimeType.startsWith("image/");
}

/**
 * Convert any still image to a web-friendly PNG: auto-rotated to its correct
 * orientation, resized so the longest edge is at most MAX_DIMENSION, and
 * compressed for small size while keeping good quality. Downscaling large phone
 * photos to 1920px is what keeps the PNG small despite PNG being lossless.
 *
 * Returns the new PNG buffer plus a `.png` filename. Throws if the image cannot
 * be decoded/encoded (caller decides whether to reject or keep the original).
 */
export async function convertImageToPng(
  buffer: Buffer,
  originalName: string,
): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
  const pngBuffer = await sharp(buffer, { failOn: "none", limitInputPixels: MAX_INPUT_PIXELS })
    .rotate() // honor EXIF orientation, then strip metadata
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .png({
      // Tuned for SPEED so the server responds quickly after the upload and
      // slow clients don't time out waiting. Palette keeps files small; a lower
      // compressionLevel + palette effort cuts CPU time dramatically (the heavy
      // settings could take several seconds per large photo on the VPS).
      compressionLevel: 6,
      quality: 80,
      palette: true,
      dither: 1,
      effort: 3,
    })
    .toBuffer();

  const base = path.basename(originalName, path.extname(originalName)) || "image";
  return { buffer: pngBuffer, filename: `${base}.png`, mimeType: "image/png" };
}
