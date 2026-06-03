import { randomUUID } from "crypto";
import path from "path";
import { isLocalStorageMode, saveLocalObject } from "./localObjectStorage";

/**
 * Save a file buffer and return a `/objects/...` URL that the app can serve.
 *
 * Two backends, selected by STORAGE_MODE:
 *  - **Local disk** (default)  — LOCAL_STORAGE_DIR or ./uploads-objects
 *  - **Replit Object Storage** — only when STORAGE_MODE=replit (uses GCS via Replit sidecar)
 */
export async function uploadToObjectStorage(
  fileBuffer: Buffer,
  originalFilename: string,
  mimeType: string,
  folder: string = "uploads"
): Promise<string> {
  if (isLocalStorageMode()) {
    return saveLocalObject(fileBuffer, originalFilename, mimeType, folder);
  }

  // Replit Object Storage path (loaded lazily so VPS deploys don't need the sidecar)
  const { objectStorageClient, ObjectStorageService } = await import(
    "./replit_integrations/object_storage/objectStorage"
  );
  const objectStorageService = new ObjectStorageService();
  const privateObjectDir = objectStorageService.getPrivateObjectDir();
  const ext = path.extname(originalFilename);
  const objectId = `${folder}/${randomUUID()}${ext}`;
  const fullPath = `${privateObjectDir}/${objectId}`;

  const pathWithSlash = fullPath.startsWith("/") ? fullPath : `/${fullPath}`;
  const pathParts = pathWithSlash.split("/");
  const bucketName = pathParts[1];
  const objectName = pathParts.slice(2).join("/");

  const bucket = objectStorageClient.bucket(bucketName);
  const file = bucket.file(objectName);

  await file.save(fileBuffer, {
    contentType: mimeType,
    resumable: false,
  });

  return `/objects/${objectId}`;
}
