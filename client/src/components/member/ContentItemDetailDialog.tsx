import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AppImage } from "@/components/media/AppImage";
import { getExternalContentLink } from "@/lib/mediaUrl";
import type { HomeContentItem } from "@/lib/memberHome";
import { ExternalLink, ShoppingCart } from "lucide-react";

interface ContentItemDetailDialogProps {
  item: HomeContentItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContentItemDetailDialog({
  item,
  open,
  onOpenChange,
}: ContentItemDetailDialogProps) {
  if (!item) return null;

  const image = item.thumbnail_url || item.media_url;
  const externalLink = getExternalContentLink(item.product_link, item.media_url);
  const isProduct = item.type === "product";

  const openExternalLink = () => {
    if (!externalLink) return;
    window.open(externalLink, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto p-0">
        {image ? (
          <AppImage
            src={image}
            alt={item.name}
            className="h-56 w-full object-cover sm:h-64"
          />
        ) : null}
        <div className="space-y-4 p-6">
          <DialogHeader className="space-y-2 text-left">
            <Badge variant="outline" className="w-fit capitalize">
              {item.type}
            </Badge>
            <DialogTitle className="text-xl leading-snug">{item.name}</DialogTitle>
          </DialogHeader>
          {item.description ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {item.description}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No additional details available.</p>
          )}
          {externalLink && (
            <Button className="w-full" onClick={openExternalLink}>
              {isProduct ? (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  View Product
                </>
              ) : (
                <>
                  Read Article
                  <ExternalLink className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
