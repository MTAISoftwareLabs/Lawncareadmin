import type { Express, Request, Response } from "express";
import express from "express";
import { promises as fsp, createReadStream, existsSync } from "fs";
import path from "path";
import crypto from "crypto";
import { allowedMediaExtensions } from "./upload";

const STORAGE_DIR =
  process.env.LOCAL_STORAGE_DIR || path.join(process.cwd(), "uploads-objects");

const TOKEN_TTL_SECONDS = 60 * 15; // 15 min

/**
 * Storage backend selection.
 *
 * Defaults to **local/server disk** storage so the app works on any plain
 * server (VPS, bare metal, Docker) with no external dependencies. Uploaded
 * files are written under LOCAL_STORAGE_DIR (or ./uploads-objects) and served
 * from the /objects/* route.
 *
 * Replit Object Storage is opt-in via STORAGE_MODE=replit and only works when
 * running on Replit infrastructure, which provides the storage sidecar at
 * 127.0.0.1:1106. On a normal server that sidecar does not exist, so trying to
 * use it would make every upload fail with a 500.
 */
export function isLocalStorageMode(): boolean {
  const mode = (process.env.STORAGE_MODE || "").trim().toLowerCase();
  if (mode === "replit" || mode === "object" || mode === "gcs") return false;
  if (mode === "local" || mode === "disk" || mode === "server") return true;
  // Default: local/server disk storage.
  return true;
}

function getSigningSecret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET required for local upload tokens");
  return s;
}

function signToken(payload: { p: string; e: number }): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", getSigningSecret())
    .update(body)
    .digest("base64url");
  return `${body}.${sig}`;
}

function verifyToken(token: string): string | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = crypto
    .createHmac("sha256", getSigningSecret())
    .update(body)
    .digest("base64url");
  if (
    sig.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  )
    return null;
  try {
    const { p, e } = JSON.parse(Buffer.from(body, "base64url").toString());
    if (typeof p !== "string" || typeof e !== "number") return null;
    if (Math.floor(Date.now() / 1000) > e) return null;
    if (!p.startsWith("/objects/") || p.includes("..")) return null;
    return p;
  } catch {
    return null;
  }
}

function objectPathToDiskPath(objectPath: string): string {
  // /objects/foo/bar.png  →  <STORAGE_DIR>/foo/bar.png
  const rel = objectPath.replace(/^\/objects\//, "");
  const abs = path.join(STORAGE_DIR, rel);
  const root = path.resolve(STORAGE_DIR);
  if (!path.resolve(abs).startsWith(root + path.sep)) {
    throw new Error("Invalid object path");
  }
  return abs;
}

/** Save a buffer to local storage and return its /objects/... URL. */
export async function saveLocalObject(
  fileBuffer: Buffer,
  originalFilename: string,
  _mimeType: string,
  folder: string = "uploads"
): Promise<string> {
  const ext = path.extname(originalFilename) || "";
  const id = crypto.randomUUID();
  const objectPath = `/objects/${folder}/${id}${ext}`;
  const disk = objectPathToDiskPath(objectPath);
  await fsp.mkdir(path.dirname(disk), { recursive: true });
  await fsp.writeFile(disk, fileBuffer);
  return objectPath;
}

export function registerLocalObjectStorageRoutes(app: Express): void {
  // Step 1: client requests an upload URL with metadata
  app.post("/api/uploads/request-url", express.json(), (req, res) => {
    try {
      const { name, contentType } = req.body || {};
      if (!name) return res.status(400).json({ error: "Missing field: name" });

      const ext = (path.extname(String(name)) || "").toLowerCase();
      if (!allowedMediaExtensions.has(ext)) {
        return res.status(400).json({ error: "Unsupported file type" });
      }
      const objectPath = `/objects/uploads/${crypto.randomUUID()}${ext}`;
      const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
      const token = signToken({ p: objectPath, e: exp });
      const proto =
        (req.headers["x-forwarded-proto"] as string) ||
        (req.secure ? "https" : "http");
      const host = req.headers["x-forwarded-host"] || req.headers.host;
      const uploadURL = `${proto}://${host}/api/uploads/put/${token}`;

      res.json({
        uploadURL,
        objectPath,
        metadata: { name, contentType },
      });
    } catch (err) {
      console.error("[local-storage] request-url error:", err);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  // Step 2: client PUTs the file body to the signed URL
  app.put(
    "/api/uploads/put/:token",
    express.raw({ type: "*/*", limit: "100mb" }),
    async (req: Request, res: Response) => {
      try {
        const objectPath = verifyToken(req.params.token);
        if (!objectPath)
          return res.status(403).json({ error: "Invalid or expired token" });

        const buf = req.body as Buffer;
        if (!Buffer.isBuffer(buf) || buf.length === 0) {
          return res.status(400).json({ error: "Empty body" });
        }

        const disk = objectPathToDiskPath(objectPath);
        await fsp.mkdir(path.dirname(disk), { recursive: true });
        await fsp.writeFile(disk, buf);
        res.json({ ok: true, objectPath });
      } catch (err) {
        console.error("[local-storage] put error:", err);
        res.status(500).json({ error: "Failed to save file" });
      }
    }
  );

  // Step 3: serve uploaded objects.
  // Supports HTTP Range requests (206 Partial Content) so that <video> streaming
  // and seeking work correctly — iOS Safari in particular refuses to play a
  // video unless the server advertises `Accept-Ranges` and honors range requests.
  const serveObject = async (req: Request, res: Response) => {
    try {
      const objectPath = `/objects/${(req.params as any)[0]}`;
      const disk = objectPathToDiskPath(objectPath);
      if (!existsSync(disk)) return res.status(404).json({ error: "Not found" });

      const stat = await fsp.stat(disk);
      const ext = path.extname(disk).toLowerCase();
      const contentType =
        ({
          ".png": "image/png",
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".gif": "image/gif",
          ".webp": "image/webp",
          // NOTE: .svg intentionally not mapped — SVG can carry scripts, so any
          // legacy .svg object falls through to application/octet-stream (+nosniff)
          // and is downloaded rather than executed in the app's origin.
          ".bmp": "image/bmp",
          ".heic": "image/heic",
          ".heif": "image/heif",
          ".mp4": "video/mp4",
          ".webm": "video/webm",
          ".mov": "video/quicktime",
          ".avi": "video/x-msvideo",
          ".mkv": "video/x-matroska",
          ".m4v": "video/x-m4v",
          ".wmv": "video/x-ms-wmv",
          ".flv": "video/x-flv",
          ".pdf": "application/pdf",
          ".json": "application/json",
          ".txt": "text/plain; charset=utf-8",
          ".csv": "text/csv; charset=utf-8",
          ".rtf": "application/rtf",
          ".zip": "application/zip",
          ".doc": "application/msword",
          ".docx":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ".xls": "application/vnd.ms-excel",
          ".xlsx":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          ".ppt": "application/vnd.ms-powerpoint",
          ".pptx":
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          ".odt": "application/vnd.oasis.opendocument.text",
          ".ods": "application/vnd.oasis.opendocument.spreadsheet",
          ".odp": "application/vnd.oasis.opendocument.presentation",
        } as Record<string, string>)[ext] || "application/octet-stream";

      const totalSize = stat.size;

      res.setHeader("Content-Type", contentType);
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Last-Modified", stat.mtime.toUTCString());

      // HEAD request: headers only, no body.
      if (req.method === "HEAD") {
        res.setHeader("Content-Length", String(totalSize));
        return res.status(200).end();
      }

      const rangeHeader = req.headers.range;
      if (rangeHeader) {
        // Only support a single `bytes=start-end` range.
        const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
        if (match) {
          const startStr = match[1];
          const endStr = match[2];
          let start: number;
          let end: number;

          if (startStr === "") {
            // Suffix range: last N bytes.
            const suffixLength = parseInt(endStr, 10);
            if (Number.isNaN(suffixLength) || suffixLength <= 0) {
              res.setHeader("Content-Range", `bytes */${totalSize}`);
              return res.status(416).end();
            }
            start = Math.max(totalSize - suffixLength, 0);
            end = totalSize - 1;
          } else {
            start = parseInt(startStr, 10);
            end = endStr === "" ? totalSize - 1 : parseInt(endStr, 10);
          }

          if (
            Number.isNaN(start) ||
            Number.isNaN(end) ||
            start > end ||
            start >= totalSize
          ) {
            res.setHeader("Content-Range", `bytes */${totalSize}`);
            return res.status(416).end();
          }

          end = Math.min(end, totalSize - 1);
          const chunkSize = end - start + 1;

          res.status(206);
          res.setHeader("Content-Range", `bytes ${start}-${end}/${totalSize}`);
          res.setHeader("Content-Length", String(chunkSize));
          createReadStream(disk, { start, end }).pipe(res);
          return;
        }
      }

      res.setHeader("Content-Length", String(totalSize));
      createReadStream(disk).pipe(res);
    } catch (err) {
      console.error("[local-storage] serve error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to serve object" });
      } else {
        res.end();
      }
    }
  };

  app.get(/^\/objects\/(.*)/, serveObject);
  app.head(/^\/objects\/(.*)/, serveObject);

  console.log(`📁 Local object storage enabled at ${STORAGE_DIR}`);
}
