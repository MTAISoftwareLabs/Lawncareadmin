import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MemberLayout } from "@/components/MemberLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useMemberAccess } from "@/hooks/useMemberAccess";
import { MemberGuard } from "@/components/MemberGuard";
import { useMemberProfile } from "@/hooks/useMemberProfile";
import { WeatherBanner } from "@/components/member/WeatherBanner";
import { SoilTempBanner } from "@/components/member/SoilTempBanner";
import { PremiumFeatureBanner } from "@/components/member/PremiumPaywall";
import { LandingBannerCarousel } from "@/components/landing/LandingBannerCarousel";
import {
  MEMBER_CATEGORIES,
  fetchHomeData,
  type MemberCategory,
} from "@/lib/memberHome";
import { Crown, Lock, Play, ChevronRight, LogIn } from "lucide-react";
import { VideoPlayerDialog } from "@/components/media/VideoPlayerDialog";
import { AppImage } from "@/components/media/AppImage";
import { resolveMediaUrl } from "@/lib/mediaUrl";

function CategoryCard({
  category,
  count,
  onNavigate,
}: {
  category: MemberCategory;
  count?: number;
  onNavigate: (href: string) => void;
}) {
  const { requiresPremium } = useSubscription();
  const locked = !requiresPremium(category.premium);
  const Icon = category.icon;

  return (
    <button
      type="button"
      onClick={() => onNavigate(category.href)}
      className="text-left"
    >
      <Card className="h-full overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
        <CardContent className="p-4">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="rounded-xl bg-green-100 p-2.5 text-green-700 dark:bg-green-900 dark:text-green-300">
              <Icon className="h-5 w-5" />
            </div>
            {category.premium && (
              <Badge variant="secondary" className="text-[10px]">
                {locked ? <Lock className="mr-1 h-3 w-3" /> : <Crown className="mr-1 h-3 w-3" />}
                Premium
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-foreground">{category.label}</h3>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{category.description}</p>
          {typeof count === "number" && (
            <p className="mt-2 text-xs font-medium text-green-700">{count} items</p>
          )}
        </CardContent>
      </Card>
    </button>
  );
}

export function MemberHomePage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const { navigateMember } = useMemberAccess();
  const { data: profile } = useMemberProfile();
  const [playingVideo, setPlayingVideo] = useState<{ url: string; title: string } | null>(null);

  const { data: home, isLoading } = useQuery({
    queryKey: ["home-data"],
    queryFn: fetchHomeData,
  });

  const handleCategoryNavigate = (href: string) => {
    navigateMember(href);
  };

  const countFor = (category: MemberCategory) => {
    if (!home || !category.section) return undefined;
    const items = home[category.section];
    return Array.isArray(items) ? items.length : undefined;
  };

  return (
    <MemberLayout>
      <div className="space-y-8">
        {!user && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950">
            <p className="text-sm text-amber-900 dark:text-amber-100">
              Browsing as guest — same as the mobile app. You can view <strong>Start Here!</strong> content; sign in for deals and profile, subscribe for premium tools.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/login?next=/app">
                <Button size="sm">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign in
                </Button>
              </Link>
              <Link href="/signup?next=/app">
                <Button size="sm" variant="outline">
                  Start free trial
                </Button>
              </Link>
            </div>
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border shadow-sm">
          <LandingBannerCarousel
            variant="card"
            banners={home?.banners ?? []}
            fallbackImages={[
              "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=1920",
              "https://images.unsplash.com/photo-1592419044706-39796d40bcae?w=1920",
            ]}
          />
        </section>

        <section className="rounded-3xl bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white shadow-lg md:p-8">
          <p className="text-sm text-green-100">
            {user ? `Welcome back${user.name ? `, ${user.name.split(" ")[0]}` : ""}` : "Welcome to The Lawncare Workshop"}
          </p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">Your lawn care workspace</h1>
          <p className="mt-3 max-w-2xl text-green-50">
            The same lessons, library, deals, competitions, and tools as the mobile app.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              className="bg-white text-green-700 hover:bg-green-50"
              onClick={() => navigateMember("/app/section/expert_corner")}
            >
              <Play className="mr-2 h-4 w-4" />
              Start Here!
            </Button>
            <Button
              variant="secondary"
              className="bg-green-500/30 text-white hover:bg-green-500/40"
              onClick={() => navigateMember("/app/ai")}
            >
              Ask AI Turf Talk
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {isPremium ? (
            <>
              <WeatherBanner zipCode={profile?.zipCode} />
              <SoilTempBanner zipCode={profile?.zipCode} />
            </>
          ) : (
            <>
              <PremiumFeatureBanner
                title="Weather Updates"
                description="Subscribe to see real-time weather for your zip code."
              />
              <PremiumFeatureBanner
                title="Soil Temperature"
                description="Subscribe to see real-time soil temperature data."
              />
            </>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Explore</h2>
              <p className="text-sm text-muted-foreground">Same categories as the mobile app</p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-36 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {MEMBER_CATEGORIES.map((category) => (
                <CategoryCard
                  key={category.key}
                  category={category}
                  count={countFor(category)}
                  onNavigate={handleCategoryNavigate}
                />
              ))}
            </div>
          )}
        </section>

        {home?.videos?.length ? (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Recent video lessons</h2>
              <Link href={user ? "/app/lessons" : "/login?next=/app/lessons"} className="text-sm font-medium text-green-700 hover:underline">
                View all <ChevronRight className="inline h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {home.videos.slice(0, 6).map((video) => {
                const videoUrl = resolveMediaUrl(video.media_url);
                return (
                  <Card
                    key={video.id}
                    className={`overflow-hidden ${videoUrl ? "cursor-pointer transition-shadow hover:shadow-md" : ""}`}
                    onClick={() => {
                      if (!videoUrl) return;
                      if (!isPremium && user?.role !== "admin") {
                        setLocation(user ? "/pricing" : "/login?next=/app/lessons");
                        return;
                      }
                      setPlayingVideo({ url: videoUrl, title: video.name || "Video lesson" });
                    }}
                  >
                    {video.thumbnail_url ? (
                      <div className="relative">
                        <AppImage src={video.thumbnail_url} alt={video.name || "Video"} className="h-40 w-full object-cover" />
                        {videoUrl && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100">
                            <Play className="h-12 w-12 text-white" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex h-40 items-center justify-center bg-green-100 dark:bg-green-900">
                        <Play className="h-10 w-10 text-green-600" />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="line-clamp-2 font-medium">{video.name || (video as { title?: string }).title || video.description}</h3>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        ) : null}
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

export function MemberHomePageRoute() {
  return (
    <MemberGuard guestAllowed>
      <MemberHomePage />
    </MemberGuard>
  );
}
