import { spawn } from "child_process";
import path from "path";
import { unlink, rename } from "fs/promises";
import { existsSync } from "fs";

export async function convertToMp4(inputPath: string): Promise<string> {
  const ext = path.extname(inputPath).toLowerCase();
  
  // If already mp4, no conversion needed
  if (ext === ".mp4") {
    return inputPath;
  }
  
  const dir = path.dirname(inputPath);
  const baseName = path.basename(inputPath, ext);
  const outputPath = path.join(dir, `${baseName}.mp4`);
  
  return new Promise((resolve, reject) => {
    console.log(`Converting video: ${inputPath} -> ${outputPath}`);
    
    const ffmpeg = spawn("ffmpeg", [
      "-i", inputPath,
      "-c:v", "libx264",
      "-c:a", "aac",
      "-preset", "fast",
      "-movflags", "+faststart",
      "-y",
      outputPath
    ]);
    
    let stderr = "";
    
    ffmpeg.stderr.on("data", (data) => {
      stderr += data.toString();
    });
    
    ffmpeg.on("close", async (code) => {
      if (code === 0) {
        console.log(`Video converted successfully: ${outputPath}`);
        // Delete original file
        try {
          await unlink(inputPath);
          console.log(`Deleted original file: ${inputPath}`);
        } catch (err) {
          console.error(`Failed to delete original file: ${inputPath}`, err);
        }
        resolve(outputPath);
      } else {
        console.error(`FFmpeg conversion failed with code ${code}`);
        console.error(stderr);
        // If conversion fails, keep the original
        reject(new Error(`Video conversion failed: ${stderr}`));
      }
    });
    
    ffmpeg.on("error", (err) => {
      console.error("FFmpeg spawn error:", err);
      reject(err);
    });
  });
}

export function isVideoFile(mimeType: string): boolean {
  return mimeType.startsWith("video/");
}

export function needsConversion(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return ext !== ".mp4" && [".mov", ".avi", ".wmv", ".flv", ".webm", ".mkv", ".m4v"].includes(ext);
}
