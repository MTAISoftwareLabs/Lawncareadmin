import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { resolveMediaUrl } from "@/lib/mediaUrl";

interface AppImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  loading?: "lazy" | "eager";
}

export function AppImage({
  src,
  alt,
  className = "",
  fallbackClassName = "",
  loading = "lazy",
}: AppImageProps) {
  const [failed, setFailed] = useState(false);
  const resolved = resolveMediaUrl(src);

  if (!resolved || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-muted text-muted-foreground ${fallbackClassName || className}`}
        aria-label={alt}
      >
        <ImageIcon className="h-8 w-8 opacity-40" />
      </div>
    );
  }

  return (
    <img
      src={resolved}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => setFailed(true)}
    />
  );
}
