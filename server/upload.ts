import multer from "multer";
import path from "path";

const memStorage = multer.memoryStorage();

const imageFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

const videoFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /mp4|avi|mov|wmv|flv|webm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype.startsWith('video/');

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed (mp4, avi, mov, wmv, flv, webm)'));
  }
};

const pdfFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

// Allowed file extensions for general media/document uploads: images, videos,
// and common document/office/archive types. Files are stored as opaque blobs
// and served back (with an extension-derived Content-Type + nosniff) for
// download/preview — never executed. This is the single source of truth shared
// by the multer filter below and the presigned-upload route in
// localObjectStorage.ts. SVG is intentionally excluded (stored-XSS vector).
export const allowedMediaExtensions = new Set([
  // images
  ".jpeg", ".jpg", ".png", ".gif", ".webp", ".bmp", ".heic", ".heif",
  // videos
  ".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm", ".mkv", ".m4v",
  // documents & archives
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
  ".txt", ".csv", ".rtf", ".odt", ".ods", ".odp", ".zip",
]);

// Gate strictly on the extension allowlist. The served Content-Type is derived
// from the extension, so an allowed extension fully determines how the file is
// later delivered — mimetype is not trusted for the accept decision.
const mediaFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedMediaExtensions.has(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type. Allowed: images, videos, and common documents (pdf, doc, docx, xls, xlsx, ppt, pptx, txt, csv, rtf, zip)."));
  }
};

export const uploadBanner = multer({
  storage: memStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter
});

export const uploadVideo = multer({
  storage: memStorage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: videoFilter
});

export const uploadContent = multer({
  storage: memStorage,
  // Generous cap so large phone photos / videos are never rejected by the
  // server. Must stay <= nginx client_max_body_size (200M) so nginx doesn't
  // reject first with a 413.
  limits: { fileSize: 150 * 1024 * 1024 },
  fileFilter: mediaFilter
});

export const uploadEbook = multer({
  storage: memStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: pdfFilter
});

export const uploadImage = multer({
  storage: memStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFilter
});
