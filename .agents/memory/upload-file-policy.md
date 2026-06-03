---
name: Upload file-type policy & serving
description: How uploads are gated/served, and why the rules are what they are
---

# Upload file-type & serving policy

`allowedMediaExtensions` in `server/upload.ts` is the **single source of truth**
for which file types may be uploaded. It is exported and reused by the presigned
flow in `server/localObjectStorage.ts`.

**Rules / decisions:**
- Acceptance is gated **strictly on the file extension** (allowlist), NOT on the
  client-supplied mimetype. **Why:** the served `Content-Type` is derived from the
  extension, so the extension alone determines how a file is later delivered;
  trusting mimetype let unintended types (`text/html`, arbitrary `application/vnd.*`)
  bypass the allowlist (`extOk || mimeOk` bug). An allowed extension fully neutralizes
  active-content risk because we control the response type + send `nosniff`.
- **`.svg` is intentionally excluded** from both upload and the serve content-type
  map. **Why:** SVG can carry scripts → stored XSS if served inline same-origin.
  Legacy `.svg` objects fall through to `application/octet-stream` (+nosniff) = download.
- Both upload entrypoints enforce the same allowlist: the multer `mediaFilter`
  (`/api/upload/media`, `/api/chats/upload`) and the presigned `/api/uploads/request-url`.
- Serve route sets `X-Content-Type-Options: nosniff` on every `/objects/*` response.

**Known residual risk (NOT yet fixed — flag to user before changing):**
- `/api/uploads/request-url` + `/api/uploads/put/:token` are **unauthenticated** by
  design — the frontend (`client/src/hooks/use-upload.ts`) sends no auth header, so
  adding `authMiddleware` would break uploads. This allows anonymous storage abuse/DoS
  (up to 100MB/PUT, no rate limit/quota). Mitigate with rate-limit/quota, not by
  bolting on auth, unless the upload flow is reworked to send credentials.
