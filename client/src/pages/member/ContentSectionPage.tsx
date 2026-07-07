import { useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { MemberLayout } from "@/components/MemberLayout";
import { MemberGuard } from "@/components/MemberGuard";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useMemberAccess } from "@/hooks/useMemberAccess";
import { PremiumPaywall } from "@/components/member/PremiumPaywall";
import { GUEST_SECTIONS } from "@/lib/premiumAccess";
import { useSavedItems } from "@/hooks/useSavedItems";
import { getSectionTabs, itemMatchesTab } from "@/lib/memberNavigation";
import {
  fetchHomeData,
  SECTION_LABELS,
  type HomeContentItem,
  type HomeSectionKey,
} from "@/lib/memberHome";
import { ArrowLeft, Bookmark, ExternalLink, Play, Search } from "lucide-react";
import { AppImage } from "@/components/media/AppImage";
import { VideoPlayerDialog } from "@/components/media/VideoPlayerDialog";
import { ContentItemDetailDialog } from "@/components/member/ContentItemDetailDialog";
import { getExternalContentLink, isVideoUrl, resolveMediaUrl } from "@/lib/mediaUrl";

const VALID_SECTIONS = new Set(Object.keys(SECTION_LABELS));

function ContentSectionInner() {
  const [, params] = useRoute("/app/section/:section");
  const { user } = useAuth();
  const section = params?.section as HomeSectionKey | undefined;
  const { isPremium } = useSubscription();
  const { canOpenSection } = useMemberAccess();
  const [search, setSearch] = useState("");
  const { isSaved, toggleSave } = useSavedItems();
  const [playingVideo, setPlayingVideo] = useState<{ url: string; title: string } | null>(null);

  const tabs = section ? getSectionTabs(section) : null;
  const [activeTab, setActiveTab] = useState(tabs?.[0]?.id ?? "all");

  const { data: home, isLoading } = useQuery({
    queryKey: ["home-data"],
    queryFn: fetchHomeData,
  });

  const isFreeSection = section ? GUEST_SECTIONS.has(section) : false;

  const items = useMemo(() => {
    if (!home || !section || !VALID_SECTIONS.has(section)) return [] as HomeContentItem[];
    let list = home[section] ?? [];

    if (tabs && activeTab !== "all") {
      const tab = tabs.find((t) => t.id === activeTab);
      if (tab) {
        list = list.filter((item) => itemMatchesTab(item.type || "", tab));
      }
    }

    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (item) =>
        item.name?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q),
    );
  }, [home, section, search, tabs, activeTab]);

  if (!section || !VALID_SECTIONS.has(section)) {
    return (
      <MemberLayout>
        <div className="rounded-2xl border bg-white p-8 text-center dark:bg-gray-900">
          <p className="text-muted-foreground">Section not found.</p>
          <Link href="/app">
            <Button className="mt-4">Back to home</Button>
          </Link>
        </div>
      </MemberLayout>
    );
  }

  if (!user && !isFreeSection) {
    return null;
  }

  if (section && !canOpenSection(section)) {
    return (
      <MemberLayout>
        <PremiumPaywall
          title={SECTION_LABELS[section]}
          description="This section is included with a premium membership — same as the mobile app."
        />
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/app">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{SECTION_LABELS[section]}</h1>
            <p className="text-sm text-muted-foreground">
              Content from your admin home-content dashboard — shared with the mobile app.
            </p>
          </div>
        </div>

        {tabs && tabs.length > 1 && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search this section..."
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border bg-white p-10 text-center text-muted-foreground dark:bg-gray-900">
            No content in this section yet. Add items in Admin → Home Content.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <ContentCard
                key={item.id}
                item={item}
                saved={isSaved(item.id)}
                onToggleSave={() => toggleSave(item, section)}
                onPlayVideo={(url, title) => setPlayingVideo({ url, title })}
              />
            ))}
          </div>
        )}
      </div>

      <VideoPlayerDialog
        open={!!playingVideo}
        onOpenChange={(open) => !open && setPlayingVideo(null)}
        videoUrl={playingVideo?.url}
        title={playingVideo?.title}
      />
    </MemberLayout>
  );
}

function ContentCard({
  item,
  saved,
  onToggleSave,
  onPlayVideo,
}: {
  item: HomeContentItem;
  saved: boolean;
  onToggleSave: () => void;
  onPlayVideo: (url: string, title: string) => void;
}) {
  const [detailOpen, setDetailOpen] = useState(false);
  const image = item.thumbnail_url || item.media_url;
  const isVideo = item.type === "video" || item.id.startsWith("vid_");
  const mediaUrl = resolveMediaUrl(item.media_url);
  const canPlayInApp = isVideo || isVideoUrl(mediaUrl);
  const externalLink = getExternalContentLink(item.product_link, item.media_url);
  const isProduct = item.type === "product";

  const handleOpen = () => {
    if (canPlayInApp && mediaUrl) {
      onPlayVideo(mediaUrl, item.name);
      return;
    }
    if (isProduct && externalLink) {
      window.open(externalLink, "_blank", "noopener,noreferrer");
      return;
    }
    setDetailOpen(true);
  };

  const openLabel = canPlayInApp ? "Watch" : isProduct && externalLink ? "View Product" : "Open";

  return (
    <>
      <Card className="overflow-hidden">
        <button type="button" className="block w-full text-left" onClick={handleOpen}>
          {image ? (
            <AppImage src={image} alt={item.name} className="h-44 w-full object-cover" />
          ) : (
            <div className="flex h-44 items-center justify-center bg-green-50 dark:bg-green-950">
              <Play className="h-10 w-10 text-green-600" />
            </div>
          )}
        </button>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 font-semibold">{item.name}</h3>
            <Badge variant="outline" className="shrink-0 text-[10px] capitalize">
              {item.type}
            </Badge>
          </div>
          {item.description && (
            <p className="line-clamp-3 text-sm text-muted-foreground">{item.description}</p>
          )}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={saved ? "default" : "outline"}
              className="flex-1"
              onClick={onToggleSave}
            >
              <Bookmark className={`mr-1 h-4 w-4 ${saved ? "fill-current" : ""}`} />
              {saved ? "Saved" : "Save"}
            </Button>
            <Button size="sm" className="flex-1" onClick={handleOpen}>
              {openLabel}
              {!canPlayInApp && <ExternalLink className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ContentItemDetailDialog
        item={item}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}

export function ContentSectionPage() {
  const [, params] = useRoute("/app/section/:section");
  const section = params?.section as HomeSectionKey | undefined;
  const guestAllowed = section ? GUEST_SECTIONS.has(section) : false;

  return (
    <MemberGuard guestAllowed={guestAllowed}>
      <ContentSectionInner />
    </MemberGuard>
  );
}
