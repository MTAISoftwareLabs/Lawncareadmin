import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface VideoPlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoUrl: string | null | undefined;
  title?: string;
}

export function VideoPlayerDialog({
  open,
  onOpenChange,
  videoUrl,
  title = "Video",
}: VideoPlayerDialogProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const src = resolveMediaUrl(videoUrl);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setError(null);
    }
  }, [open, src]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b px-4 py-3">
          <DialogTitle className="line-clamp-2 pr-8 text-left">{title}</DialogTitle>
        </DialogHeader>
        <div className="relative aspect-video bg-black">
          {!src ? (
            <div className="flex h-full items-center justify-center text-sm text-white/80">
              Video unavailable
            </div>
          ) : (
            <>
              {loading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60">
                  <Loader2 className="h-10 w-10 animate-spin text-white" />
                </div>
              )}
              <video
                key={src}
                src={src}
                controls
                playsInline
                autoPlay
                className="h-full w-full"
                onLoadedData={() => setLoading(false)}
                onError={() => {
                  setLoading(false);
                  setError("Could not load this video. Try again later.");
                }}
              />
            </>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4 text-center text-sm text-white">
              {error}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
