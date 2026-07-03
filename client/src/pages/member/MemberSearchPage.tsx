import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { MemberPageWrapper } from "@/components/MemberPageWrapper";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { filterCategories } from "@/lib/memberNavigation";
import { fetchHomeData, SECTION_LABELS, type HomeContentItem } from "@/lib/memberHome";
import { Search, ChevronRight } from "lucide-react";

interface SearchResult {
  section: string;
  label: string;
  item: HomeContentItem;
}

function MemberSearchContent() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const [query, setQuery] = useState("");

  const { data: home, isLoading } = useQuery({
    queryKey: ["home-data"],
    queryFn: fetchHomeData,
  });

  const categoryResults = useMemo(() => filterCategories(query), [query]);

  const contentResults = useMemo(() => {
    if (!home || !query.trim()) return [] as SearchResult[];
    const q = query.toLowerCase();
    const matches: SearchResult[] = [];

    (Object.keys(SECTION_LABELS) as Array<keyof typeof SECTION_LABELS>).forEach((section) => {
      const items = home[section] ?? [];
      items.forEach((item) => {
        if (
          item.name?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q)
        ) {
          matches.push({ section, label: SECTION_LABELS[section], item });
        }
      });
    });

    home.videos?.forEach((item) => {
      if (item.name?.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q)) {
        matches.push({ section: "videos", label: "Video Lessons", item });
      }
    });

    home.lawn_library?.forEach((item) => {
      if (item.name?.toLowerCase().includes(q)) {
        matches.push({
          section: "lawn_library",
          label: "Lawn Library",
          item: {
            id: item.id,
            type: "ebook",
            name: item.name,
            media_url: item.download_url,
            thumbnail_url: item.image_url,
          },
        });
      }
    });

    return matches;
  }, [home, query]);

  const handleCategoryClick = (href: string, premium: boolean, guest?: boolean) => {
    if (!user && !guest) {
      setLocation(`/login?next=${encodeURIComponent(href)}`);
      return;
    }
    if (premium && !isPremium && user?.role !== "admin") {
      setLocation(user ? "/pricing" : `/login?next=${encodeURIComponent(href)}`);
      return;
    }
    setLocation(href);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Search</h1>
        <p className="text-sm text-muted-foreground">
          Find categories or content — same as the mobile app search.
        </p>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search categories, articles, videos..."
          className="pl-10"
          autoFocus
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      ) : !query.trim() ? (
        <p className="text-muted-foreground">Start typing to search categories and content.</p>
      ) : (
        <>
          {categoryResults.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Categories
              </h2>
              <div className="space-y-2">
                {categoryResults.map((cat) => (
                  <Card
                    key={cat.href}
                    className="cursor-pointer transition-colors hover:bg-green-50 dark:hover:bg-green-950"
                    onClick={() => handleCategoryClick(cat.href, cat.premium, cat.guest)}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{cat.label}</span>
                        {cat.premium && <Badge variant="secondary">Premium</Badge>}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Content {contentResults.length > 0 ? `(${contentResults.length})` : ""}
            </h2>
            {contentResults.length === 0 && categoryResults.length === 0 ? (
              <p className="text-muted-foreground">No results for "{query}".</p>
            ) : (
              <div className="space-y-3">
                {contentResults.map((result) => (
                  <Card key={`${result.section}-${result.item.id}`}>
                    <CardContent className="flex items-start justify-between gap-4 p-4">
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <Badge variant="outline">{result.label}</Badge>
                          <Badge variant="secondary" className="capitalize">
                            {result.item.type}
                          </Badge>
                        </div>
                        <h3 className="font-medium">{result.item.name}</h3>
                        {result.item.description && (
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {result.item.description}
                          </p>
                        )}
                      </div>
                      {result.section !== "videos" && result.section !== "lawn_library" ? (
                        <Link href={`/app/section/${result.section}`} className="text-sm text-green-700 hover:underline">
                          Open section
                        </Link>
                      ) : result.item.media_url ? (
                        <a
                          href={result.item.media_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-green-700 hover:underline"
                        >
                          Open
                        </a>
                      ) : null}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export function MemberSearchPage() {
  return (
    <MemberPageWrapper
      premiumRequired
      paywallTitle="Search"
      paywallDescription="Premium members can search categories and content across the app — same as the mobile search tab."
    >
      <MemberSearchContent />
    </MemberPageWrapper>
  );
}
