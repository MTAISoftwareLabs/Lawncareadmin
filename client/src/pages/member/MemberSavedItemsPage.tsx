import { useState } from "react";
import { Link } from "wouter";
import { MemberLayout } from "@/components/MemberLayout";
import { MemberGuard } from "@/components/MemberGuard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSavedItems } from "@/hooks/useSavedItems";
import { VideoPlayerDialog } from "@/components/media/VideoPlayerDialog";
import { ContentItemDetailDialog } from "@/components/member/ContentItemDetailDialog";
import { AppImage } from "@/components/media/AppImage";
import { getExternalContentLink, isVideoUrl, resolveMediaUrl } from "@/lib/mediaUrl";
import type { HomeContentItem } from "@/lib/memberHome";
import { Bookmark, ExternalLink, Play } from "lucide-react";

function SavedItemsContent() {
  const { items, remove } = useSavedItems();
  const [playingVideo, setPlayingVideo] = useState<{ url: string; title: string } | null>(null);
  const [detailItem, setDetailItem] = useState<HomeContentItem | null>(null);

  const openItem = (item: (typeof items)[number]) => {
    const mediaUrl = resolveMediaUrl(item.media_url);
    if (isVideoUrl(mediaUrl) && mediaUrl) {
      setPlayingVideo({ url: mediaUrl, title: item.name });
      return;
    }
    const externalLink = getExternalContentLink(item.product_link, item.media_url);
    if (item.type === "product" && externalLink) {
      window.open(externalLink, "_blank", "noopener,noreferrer");
      return;
    }
    setDetailItem(item);
  };

  return (
    <MemberLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Saved items</h1>
          <p className="text-sm text-muted-foreground">
            Synced to your account — available on web and when you sign in on any device.
          </p>
        </div>

        {items.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <Bookmark className="h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">No saved items yet</p>
              <Link href="/app">
                <Button>Browse content</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((item) => {
              const mediaUrl = resolveMediaUrl(item.media_url);
              const canPlay = isVideoUrl(mediaUrl);
              return (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {item.thumbnail_url ? (
                        <AppImage
                          src={item.thumbnail_url}
                          alt={item.name}
                          className="h-20 w-20 rounded-lg object-cover"
                        />
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {item.type}
                          </Badge>
                          {item.section && (
                            <Badge variant="secondary">{item.section}</Badge>
                          )}
                        </div>
                        <h3 className="font-semibold line-clamp-2">{item.name}</h3>
                        {item.description && (
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openItem(item)}>
                            {canPlay ? (
                              <>
                                <Play className="mr-1 h-3 w-3" />
                                Watch
                              </>
                            ) : (
                              <>
                                Open
                                <ExternalLink className="ml-1 h-3 w-3" />
                              </>
                            )}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => remove(item.id)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <VideoPlayerDialog
        open={!!playingVideo}
        onOpenChange={(open) => !open && setPlayingVideo(null)}
        videoUrl={playingVideo?.url}
        title={playingVideo?.title}
      />

      <ContentItemDetailDialog
        item={detailItem}
        open={!!detailItem}
        onOpenChange={(open) => !open && setDetailItem(null)}
      />
    </MemberLayout>
  );
}

export function MemberSavedItemsPage() {
  return (
    <MemberGuard>
      <SavedItemsContent />
    </MemberGuard>
  );
}
