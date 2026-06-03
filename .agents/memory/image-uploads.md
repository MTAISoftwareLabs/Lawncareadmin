---
name: Image upload handling & failure diagnosis
description: Why "upload failed / Status: null" happens, and the server-side PNG auto-conversion decision.
---

# Upload failure diagnosis (the recurring "Failed to upload image. Status: null")

The mobile client is a **Flutter app that LIVES IN THIS REPO** under `mobileapp/`
(GetX/GetConnect). **It spoofs a desktop Chrome User-Agent** in
`mobileapp/lib/services/base_client.dart` (`Mozilla/5.0 ... Chrome/120 ... Windows`).
So the failing **`Chrome/120 (Windows)` uploads to `/api/upload/media` in nginx logs ARE
the iOS app, not a desktop browser.** (Raw `Dart/3.10 (dart:io)` UA only shows on some
GET/download paths.) Don't re-misdiagnose this as "a web browser is failing."

Intermittent upload failures are **client-side aborts of large uploads**, NOT a backend bug:
- nginx logs show completed uploads → `200`; failures are `499` (client closed
  connection) and `400` with a **0-byte body** (nginx-generated truncated/aborted
  request). The Node app's own errors are `500` (global handler) or a `400` *with a
  JSON body* — so a 0-byte 400 is always nginx/client, not the app.
- The VPS is well-resourced (16GB RAM, no swap, load ~0, no OOM) — never the cause.
- Photos were full-res 6–7MB; weak cellular + the app's own timeout = aborted upload.

**Why:** future "uploads sometimes fail" reports should be triaged as client/network
first; confirm via nginx access log status codes before touching server code.
**How to apply:** grep `/var/log/nginx/access.log` for the upload path; 499 / "400 0"
= client abort. Confirm the app never logged the request (no "Error uploading", no
conversion log) → body never completed → it's client→nginx, not the app. **THE REAL FIX (done, in `mobileapp/`):** downscale/compress photos on-device *before*
upload via `image_picker`'s built-in `pickImage(maxWidth: 1920, maxHeight: 1920,
imageQuality: 85)` — applied to all pick call sites (weed_id, questions, forum, contest,
edit_profile, chat_detail gallery+camera). `File(image.path)` then points at the
compressed temp file, so the small file is what gets uploaded (~7MB → ~400KB). Also set
`httpClient.timeout = Duration(minutes: 5)` on the GetConnect BaseClient so slow uploads
aren't aborted early. No new dependency. NOTE: the mobile app is built & submitted to the
App Store by the owner (TurfguyRoss) — editing `mobileapp/` here does NOT deploy it; he
must rebuild/resubmit. Video uploads are still uncompressed (separate concern).
Server-side levers can only reduce, not eliminate, it:
keep nginx body/proxy timeouts generous (client_body_timeout/proxy_read/send 300s),
keep multer fileSize <= nginx client_max_body_size, and keep post-upload work fast.

**Don't bother with these (tried, not the lever):** `proxy_request_buffering off` —
multer uses memoryStorage so Node buffers the whole file in RAM anyway; turning off
nginx buffering just shifts slow-client load onto Node (memory pressure) without
touching the client→nginx abort. And don't raise sharp limitInputPixels past ~100MP
on the small VPS (decode RAM blows up) — phone photos are <50MP.

# Decision: server auto-converts uploaded images to compact PNG

All images uploaded via the shared upload routes are re-encoded server-side with
**sharp** to PNG: EXIF-rotated, downscaled to max 1920px longest edge, compressed.
GIF (animation) and SVG are skipped. HEIC/HEIF are convertible (sharp prebuilt has
HEIF read), but if conversion *fails* and the original isn't browser-renderable
(heic/heif/bmp/tiff) the route returns 422 instead of storing an unviewable file.

**Why:** user explicitly asked for "always PNG, good quality, small size." PNG is
lossless so it's larger than JPEG/WebP for photos — the *downscale to 1920px* is what
actually keeps files small. Conversion happens AFTER upload, so it shrinks
stored/served bytes (faster downloads) but does NOT fix upload-time aborts.
**How to apply:** `sharp` is a native module — it must be `npm install`ed on the VPS
too (not just Replit), matching the VPS Node version, or the app crashes on require.
