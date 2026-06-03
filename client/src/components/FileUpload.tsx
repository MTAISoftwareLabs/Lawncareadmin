import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, FileImage, FileText, Loader2 } from "lucide-react";

interface FileUploadProps {
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  uploadType?: "image" | "content" | "pdf";
  label?: string;
  placeholder?: string;
}

export function FileUpload({ 
  value, 
  onChange, 
  accept = "image/*", 
  uploadType = "image",
  label,
  placeholder = "Upload a file or paste URL"
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/admin/upload/${uploadType}`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        onChange(data.url);
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClear = () => {
    onChange("");
    setError(null);
  };

  const isImage = value && (value.match(/\.(jpg|jpeg|png|gif|webp)$/i) || value.startsWith("data:image"));
  const isPdf = value && value.match(/\.pdf$/i);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {value && (
        <div className="mt-2">
          {isImage ? (
            <div className="relative inline-block">
              <img
                src={value}
                alt="Preview"
                className="h-20 w-auto rounded border object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          ) : isPdf ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>PDF file uploaded</span>
              <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                View
              </a>
            </div>
          ) : value ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileImage className="h-4 w-4" />
              <span className="truncate max-w-xs">{value}</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
