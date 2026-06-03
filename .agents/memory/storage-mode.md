---
name: File/media storage backend selection
description: How the app chooses local-disk vs Replit Object Storage for uploads
---

# Storage backend selection

`isLocalStorageMode()` in `server/localObjectStorage.ts` decides where uploaded
media (chat images, etc.) goes. It now **defaults to local/server disk** and
only uses Replit Object Storage when `STORAGE_MODE=replit` (also accepts
`object`/`gcs`). `local`/`disk`/`server` force local.

**Why:** Production is a self-hosted VPS (thelawncareworkshop.com), not Replit.
The old logic keyed off `PRIVATE_OBJECT_DIR` being set → "use Replit storage".
The VPS `.env` was copied from `.env.example` which set `PRIVATE_OBJECT_DIR`, so
the app tried to reach the Replit Object Storage sidecar at `127.0.0.1:1106`
(only exists on Replit) and every upload 500'd. Defaulting to local disk avoids
this on any plain server.

**How to apply:** On a VPS keep `STORAGE_MODE=local` (or unset) and set
`LOCAL_STORAGE_DIR` to a persistent absolute path; files are written there and
served from `/objects/*`. On Replit set `STORAGE_MODE=replit` to use the bucket.
Both backends are selected consistently in `server/index.ts` (route registration)
and `server/objectStorageUpload.ts` (direct uploads).
