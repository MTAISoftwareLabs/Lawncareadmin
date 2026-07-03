import type { LucideIcon } from "lucide-react";
import {
  Sparkles,
  Lightbulb,
  Wrench,
  FlaskConical,
  Calendar,
  Tag,
  Droplets,
  Bot,
  Stethoscope,
  ScanSearch,
  BookOpen,
  Bug,
} from "lucide-react";

export interface HomeContentItem {
  id: string;
  type: string;
  name: string;
  description?: string | null;
  media_url?: string | null;
  thumbnail_url?: string | null;
  product_link?: string | null;
  created_at?: string;
}

export interface HomeBanner {
  id: number;
  title: string;
  image_url: string;
  redirect_url?: string | null;
}

export interface HomeDeal {
  id: string;
  title: string;
  link?: string;
  affiliate_link?: string;
  image_url?: string;
}

export interface HomeEbook {
  id: string;
  name: string;
  image_url?: string;
  download_url?: string;
}

export interface HomeData {
  banners: HomeBanner[];
  expert_corner: HomeContentItem[];
  tips_tricks: HomeContentItem[];
  equipments: HomeContentItem[];
  fertilizer_herbicide: HomeContentItem[];
  soil_water: HomeContentItem[];
  insects_disease: HomeContentItem[];
  deals: HomeDeal[];
  calenders: unknown[];
  self_diagnosis: unknown[];
  lawn_library: HomeEbook[];
  videos: HomeContentItem[];
  products: HomeContentItem[];
  active_competition?: unknown;
}

export type HomeSectionKey =
  | "expert_corner"
  | "tips_tricks"
  | "equipments"
  | "fertilizer_herbicide"
  | "soil_water"
  | "insects_disease";

export interface MemberCategory {
  key: HomeSectionKey | "calendar" | "deals" | "ask_ai" | "self_diagnosis" | "weed_id" | "lawn_library";
  label: string;
  description: string;
  icon: LucideIcon;
  href: string;
  premium: boolean;
  section?: HomeSectionKey;
}

export const MEMBER_CATEGORIES: MemberCategory[] = [
  {
    key: "expert_corner",
    label: "Start Here!",
    description: "Expert's Corner — foundations for a healthier lawn",
    icon: Sparkles,
    href: "/app/section/expert_corner",
    premium: false,
    section: "expert_corner",
  },
  {
    key: "tips_tricks",
    label: "Tips & Tricks",
    description: "Maintenance, advanced, and seasonal guidance",
    icon: Lightbulb,
    href: "/app/section/tips_tricks",
    premium: true,
    section: "tips_tricks",
  },
  {
    key: "equipments",
    label: "Equipment",
    description: "Mowers, spreaders, and gear recommendations",
    icon: Wrench,
    href: "/app/section/equipments",
    premium: true,
    section: "equipments",
  },
  {
    key: "fertilizer_herbicide",
    label: "Fert & Herb",
    description: "Fertilizer and herbicide education",
    icon: FlaskConical,
    href: "/app/section/fertilizer_herbicide",
    premium: true,
    section: "fertilizer_herbicide",
  },
  {
    key: "calendar",
    label: "Calendar",
    description: "Regional lawn care calendars and PDF guides",
    icon: Calendar,
    href: "/app/calendars",
    premium: true,
  },
  {
    key: "deals",
    label: "Deals",
    description: "Curated retailer offers for members",
    icon: Tag,
    href: "/app/deals",
    premium: false,
  },
  {
    key: "soil_water",
    label: "Soil & Water",
    description: "Irrigation, soil health, and moisture management",
    icon: Droplets,
    href: "/app/section/soil_water",
    premium: true,
    section: "soil_water",
  },
  {
    key: "ask_ai",
    label: "Ask AI",
    description: "AI Turf Talk — lawn care Q&A assistant",
    icon: Bot,
    href: "/app/ai",
    premium: true,
  },
  {
    key: "self_diagnosis",
    label: "Self Diagnosis",
    description: "Step-by-step lawn problem wizard",
    icon: Stethoscope,
    href: "/app/self-diagnosis",
    premium: true,
  },
  {
    key: "weed_id",
    label: "AI Weed ID",
    description: "Photo diagnosis for weeds and turf issues",
    icon: ScanSearch,
    href: "/app/diagnosis",
    premium: true,
  },
  {
    key: "lawn_library",
    label: "Lawn Library",
    description: "Downloadable ebooks and reference guides",
    icon: BookOpen,
    href: "/app/library",
    premium: true,
  },
  {
    key: "insects_disease",
    label: "Insects & Disease ID",
    description: "Identify pests and turf diseases",
    icon: Bug,
    href: "/app/section/insects_disease",
    premium: true,
    section: "insects_disease",
  },
];

export const SECTION_LABELS: Record<HomeSectionKey, string> = {
  expert_corner: "Start Here! — Expert's Corner",
  tips_tricks: "Tips & Tricks",
  equipments: "Equipment",
  fertilizer_herbicide: "Fertilizer & Herbicides",
  soil_water: "Soil & Water",
  insects_disease: "Insects & Disease ID",
};

function normalizeHomeData(data: HomeData): HomeData {
  return {
    ...data,
    videos: (data.videos ?? []).map((video) => {
      const raw = video as HomeContentItem & { video_url?: string; title?: string };
      return {
        ...video,
        name: video.name || raw.title || "Video lesson",
        media_url: video.media_url || raw.video_url || null,
      };
    }),
  };
}

export async function fetchHomeData(): Promise<HomeData> {
  const response = await fetch("/api/home", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to load home content");
  const json = await response.json();
  return normalizeHomeData(json.data as HomeData);
}
