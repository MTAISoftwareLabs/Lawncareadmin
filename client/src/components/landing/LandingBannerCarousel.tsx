import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HomeBanner } from "@/lib/memberHome";
import { AppImage } from "@/components/media/AppImage";

interface LandingBannerCarouselProps {
  banners: HomeBanner[];
  fallbackImage?: string | null;
  fallbackImages?: string[];
  className?: string;
  /** Full-bleed hero — edge to edge, tall */
  variant?: "card" | "hero";
  /** Content overlaid on bottom of hero banners */
  overlay?: ReactNode;
}

function buildSlides(
  banners: HomeBanner[],
  fallbackImage?: string | null,
  fallbackImages?: string[],
): HomeBanner[] {
  if (banners.length > 0) return banners;

  const urls = [
    ...(fallbackImages ?? []),
    ...(fallbackImage ? [fallbackImage] : []),
  ].filter((url, i, arr) => url && arr.indexOf(url) === i) as string[];

  return urls.map((url, i) => ({
    id: i,
    title: "The Lawncare Workshop",
    image_url: url,
    redirect_url: null,
  }));
}

export function LandingBannerCarousel({
  banners,
  fallbackImage,
  fallbackImages,
  className = "",
  variant = "card",
  overlay,
}: LandingBannerCarouselProps) {
  const slides = useMemo(
    () => buildSlides(banners, fallbackImage, fallbackImages),
    [banners, fallbackImage, fallbackImages],
  );

  const [index, setIndex] = useState(0);
  const isHero = variant === "hero";

  useEffect(() => {
    setIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const heightClass = isHero
    ? "h-[min(85vh,760px)] min-h-[520px] sm:min-h-[560px]"
    : "h-56 md:h-72 lg:h-80";

  const goTo = (next: number) => {
    setIndex((next + slides.length) % slides.length);
  };

  if (slides.length === 0) {
    return (
      <div
        className={`relative flex w-full items-center justify-center bg-gradient-to-br from-green-700 to-emerald-900 text-white ${heightClass} ${className}`}
      >
        <p className="text-lg font-semibold">The Lawncare Workshop</p>
        {overlay && (
          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-4 pb-10 pt-24 md:px-8 md:pb-14">
            <div className="mx-auto max-w-7xl">{overlay}</div>
          </div>
        )}
      </div>
    );
  }

  const slideTrack = (
    <div className={`relative w-full overflow-hidden ${heightClass} ${isHero ? "" : "rounded-2xl border shadow-xl"}`}>
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="relative h-full w-full flex-shrink-0">
            {slide.redirect_url && !overlay && !isHero ? (
              <a href={slide.redirect_url} target="_blank" rel="noopener noreferrer" className="block h-full">
                <AppImage src={slide.image_url} alt={slide.title} className="h-full w-full object-cover" loading="eager" />
              </a>
            ) : (
              <AppImage src={slide.image_url} alt={slide.title} className="h-full w-full object-cover" loading="eager" />
            )}
            <div
              className={`absolute inset-0 ${
                isHero
                  ? "bg-gradient-to-t from-black/90 via-black/45 to-black/25"
                  : "bg-gradient-to-t from-black/70 via-black/20 to-transparent"
              }`}
            />
            {!isHero && (
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                <p className="text-lg font-bold text-white drop-shadow md:text-2xl">{slide.title}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {isHero && !overlay && slides[index]?.title && (
        <div className="pointer-events-none absolute bottom-20 left-0 right-0 px-4 md:px-8">
          <p className="mx-auto max-w-7xl text-xl font-bold text-white drop-shadow md:text-3xl">
            {slides[index].title}
          </p>
        </div>
      )}

      {overlay && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-4 pb-10 pt-32 md:px-8 md:pb-14">
          <div className="pointer-events-auto mx-auto max-w-7xl">{overlay}</div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`relative w-full ${className}`}>
      {slideTrack}

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            className={`absolute top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70 ${
              isHero ? "left-4 md:left-8" : "left-2"
            }`}
            aria-label="Previous banner"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            className={`absolute top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70 ${
              isHero ? "right-4 md:right-8" : "right-2"
            }`}
            aria-label="Next banner"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div
            className={`z-20 flex justify-center gap-2 ${
              isHero
                ? overlay
                  ? "absolute bottom-4 left-0 right-0 md:bottom-6"
                  : "absolute bottom-4 left-0 right-0 md:bottom-6"
                : "mt-3"
            }`}
          >
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={`rounded-full transition-all ${
                  isHero ? "h-2.5" : "h-2"
                } ${i === index ? "w-8 bg-white" : "w-2.5 bg-white/40 hover:bg-white/60"}`}
                aria-label={`Go to banner ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
