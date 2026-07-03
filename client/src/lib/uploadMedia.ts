export async function uploadMediaFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload/media", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(json.error || "Failed to upload file");
  }

  const url = json.data?.url ?? json.url;
  if (!url) throw new Error("Upload did not return a URL");
  return url;
}
