import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Leaf, ShoppingBag, ExternalLink, Search, Tag, Percent, Star,
  Filter
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import type { EmbeddedPageProps } from "@/components/MemberPageWrapper";
import { PageShell, PageContainer } from "@/components/MemberPageWrapper";
import { MarketingSiteHeader } from "@/components/MarketingSiteHeader";
import { AppImage } from "@/components/media/AppImage";

interface Deal {
  id: number;
  title: string;
  description: string;
  originalPrice: string;
  salePrice: string;
  discountPercent: number;
  store: string;
  storeUrl: string;
  imageUrl: string;
  category: string;
  isFeatured: boolean;
}

const categories = ["All", "Fertilizer", "Seed", "Equipment", "Tools", "Pest Control"];

export function DealsPage({ embedded = false }: EmbeddedPageProps = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: dealsResponse, isLoading } = useQuery<{ success?: boolean; data?: Deal[] } | Deal[]>({
    queryKey: ["/api/deals"],
  });

  const deals: Deal[] = Array.isArray(dealsResponse)
    ? dealsResponse
    : dealsResponse?.data ?? [];

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch = deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         deal.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || deal.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredDeals = filteredDeals.filter(d => d.isFeatured);
  const regularDeals = filteredDeals.filter(d => !d.isFeatured);

  return (
    <PageShell embedded={embedded}>
      {!embedded && <MarketingSiteHeader />}

      <PageContainer embedded={embedded}>
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Product Deals</h1>
          <p className="text-muted-foreground">
            Curated deals on lawn care products from trusted retailers.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search deals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-deals"
              />
            </div>
          </div>
          
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(category)}
                data-testid={`filter-category-${category.toLowerCase()}`}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Featured Deals */}
        {featuredDeals.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-semibold text-foreground">Featured Deals</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDeals.map((deal, index) => (
                <motion.div
                  key={deal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <DealCard deal={deal} featured />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* All Deals */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-muted" />
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : regularDeals.length > 0 || (!featuredDeals.length && !regularDeals.length) ? (
          <>
            {regularDeals.length > 0 && (
              <>
                <h2 className="text-xl font-semibold text-foreground mb-6">All Deals</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {regularDeals.map((deal, index) => (
                    <motion.div
                      key={deal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <DealCard deal={deal} />
                    </motion.div>
                  ))}
                </div>
              </>
            )}
            {!featuredDeals.length && !regularDeals.length && (
              <div className="text-center py-16">
                <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No deals found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || selectedCategory !== "All" 
                    ? "Try adjusting your search or filters"
                    : "Check back soon for new deals!"}
                </p>
                {(searchQuery || selectedCategory !== "All") && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </>
        ) : null}

        {/* Newsletter CTA */}
        <Card className="mt-12 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <Tag className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Never Miss a Deal
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Premium members get exclusive deals and early access to the best lawn care products.
            </p>
            <Link href="/signup">
              <Button size="lg">
                Start Your Free Trial
              </Button>
            </Link>
          </CardContent>
        </Card>
      </PageContainer>
    </PageShell>
  );
}

function DealCard({ deal, featured = false }: { deal: Deal; featured?: boolean }) {
  return (
    <Card 
      className={`overflow-hidden border-border hover-elevate ${
        featured ? 'border-yellow-500/30' : ''
      }`}
      data-testid={`deal-card-${deal.id}`}
    >
      <div className="relative aspect-square bg-muted">
        {deal.imageUrl ? (
          <AppImage 
            src={deal.imageUrl} 
            alt={deal.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <ShoppingBag className="w-12 h-12 text-primary/30" />
          </div>
        )}
        <Badge className="absolute top-2 right-2 bg-red-500">
          <Percent className="w-3 h-3 mr-1" />
          {deal.discountPercent}% OFF
        </Badge>
        <Badge variant="secondary" className="absolute bottom-2 left-2">
          {deal.category}
        </Badge>
      </div>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground mb-1">{deal.store}</div>
        <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{deal.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{deal.description}</p>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl font-bold text-primary">${deal.salePrice}</span>
          <span className="text-sm text-muted-foreground line-through">${deal.originalPrice}</span>
        </div>
        <a href={deal.storeUrl} target="_blank" rel="noopener noreferrer">
          <Button className="w-full" variant={featured ? "default" : "outline"}>
            View Deal
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </a>
      </CardContent>
    </Card>
  );
}
