import { Link } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Lock } from "lucide-react";
import { AppImage } from "@/components/media/AppImage";
import {
  MEMBER_CATEGORIES,
  type HomeData,
  type MemberCategory,
} from "@/lib/memberHome";

function getCategoryCover(category: MemberCategory, home?: HomeData): string | null {
  if (!home) return null;

  if (category.section) {
    const item = home[category.section]?.[0];
    return item?.thumbnail_url || item?.media_url || null;
  }

  if (category.key === "deals") {
    return home.deals?.[0]?.image_url || null;
  }
  if (category.key === "lawn_library") {
    return home.lawn_library?.[0]?.image_url || null;
  }
  if (category.key === "calendar") {
    const cal = home.calenders?.[0] as { image_url?: string } | undefined;
    return cal?.image_url || null;
  }

  return null;
}

function countForCategory(category: MemberCategory, home?: HomeData): number | undefined {
  if (!home) return undefined;
  if (category.section) {
    const items = home[category.section];
    return Array.isArray(items) ? items.length : undefined;
  }
  if (category.key === "deals") return home.deals?.length;
  if (category.key === "lawn_library") return home.lawn_library?.length;
  return undefined;
}

function CategoryCard({
  category,
  home,
}: {
  category: MemberCategory;
  home?: HomeData;
}) {
  const cover = getCategoryCover(category, home);
  const count = countForCategory(category, home);
  const Icon = category.icon;
  const href = category.premium ? "/signup" : category.href;

  return (
    <Link href={href}>
      <Card className="group h-full overflow-hidden border-border transition-all hover:-translate-y-0.5 hover:shadow-lg">
        <div className="relative h-28 overflow-hidden bg-green-100 dark:bg-green-950">
          {cover ? (
            <AppImage
              src={cover}
              alt={category.label}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900 dark:to-emerald-950">
              <Icon className="h-10 w-10 text-green-700 dark:text-green-300" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-2 left-2 right-2">
            <p className="text-sm font-bold text-white drop-shadow">{category.label}</p>
          </div>
          {category.premium && (
            <Badge className="absolute right-2 top-2 bg-amber-500/90 text-white hover:bg-amber-500/90">
              <Crown className="mr-1 h-3 w-3" />
              Premium
            </Badge>
          )}
        </div>
        <CardContent className="p-3">
          <p className="line-clamp-2 text-xs text-muted-foreground">{category.description}</p>
          {typeof count === "number" && (
            <p className="mt-1 text-xs font-medium text-green-700">{count} items</p>
          )}
          {category.premium && (
            <p className="mt-1 flex items-center gap-1 text-[10px] text-amber-700">
              <Lock className="h-3 w-3" />
              Sign up to unlock
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export function LandingAppCategories({ home }: { home?: HomeData }) {
  return (
    <section className="border-y border-border bg-card py-12 md:py-16" id="explore">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center md:mb-10">
          <h2 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">Explore the app</h2>
          <p className="text-muted-foreground">
            Same categories as the mobile app — managed from your admin dashboard
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {MEMBER_CATEGORIES.map((category, index) => (
            <motion.div
              key={category.key}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              viewport={{ once: true }}
            >
              <CategoryCard category={category} home={home} />
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/app">
            <Badge variant="outline" className="cursor-pointer px-4 py-2 text-sm hover:bg-muted">
              Open web app
            </Badge>
          </Link>
          <Link href="/app/section/expert_corner">
            <Badge variant="outline" className="cursor-pointer px-4 py-2 text-sm hover:bg-muted">
              Start Here — free preview
            </Badge>
          </Link>
        </div>
      </div>
    </section>
  );
}
