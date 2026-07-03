import type { HomeSectionKey } from "./memberHome";

export const SEARCH_CATEGORIES = [
  { label: "Start Here!", href: "/app/section/expert_corner", premium: false, guest: true },
  { label: "Tips & Tricks", href: "/app/section/tips_tricks", premium: true, guest: false },
  { label: "Equipment", href: "/app/section/equipments", premium: true, guest: false },
  { label: "Fert & Herb", href: "/app/section/fertilizer_herbicide", premium: true, guest: false },
  { label: "Calendar", href: "/app/calendars", premium: true, guest: false },
  { label: "Deals", href: "/app/deals", premium: false, guest: false },
  { label: "Soil & Water", href: "/app/section/soil_water", premium: true, guest: false },
  { label: "Ask AI", href: "/app/ai", premium: true, guest: false },
  { label: "Self Diagnosis", href: "/app/self-diagnosis", premium: true, guest: false },
  { label: "AI Weed ID", href: "/app/diagnosis", premium: true, guest: false },
  { label: "Lawn Library", href: "/app/library", premium: true, guest: false },
  { label: "Insects & Disease ID", href: "/app/section/insects_disease", premium: true, guest: false },
] as const;

export function filterCategories(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return SEARCH_CATEGORIES.filter((cat) => cat.label.toLowerCase().includes(q));
}

export interface ContentTab {
  id: string;
  label: string;
  types: string[];
}

export function getSectionTabs(section: HomeSectionKey, isDeals = false): ContentTab[] | null {
  if (isDeals) return null;

  if (section === "tips_tricks") {
    return [
      { id: "future", label: "Future", types: ["future"] },
      { id: "maintenance", label: "Maintenance", types: ["maintenance", "maintance"] },
      { id: "advanced", label: "Advanced", types: ["advanced", "advance"] },
    ];
  }

  return [
    { id: "article", label: "Articles", types: ["article"] },
    { id: "video", label: "Videos", types: ["video"] },
    { id: "product", label: "Products", types: ["product"] },
  ];
}

export function itemMatchesTab(itemType: string, tab: ContentTab) {
  const normalized = itemType.toLowerCase().trim();
  return tab.types.some((type) => type === normalized);
}
