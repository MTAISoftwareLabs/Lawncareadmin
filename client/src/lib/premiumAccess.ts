import type { HomeSectionKey } from "./memberHome";

/** Only section guests may browse without logging in (matches mobile app). */
export const GUEST_SECTIONS = new Set<HomeSectionKey>(["expert_corner"]);

export const GUEST_SESSION_KEY = "lawncare_guest_browse";

export function isGuestBrowseMode(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(GUEST_SESSION_KEY) === "1";
}

export function setGuestBrowseMode(enabled: boolean) {
  if (typeof window === "undefined") return;
  if (enabled) {
    sessionStorage.setItem(GUEST_SESSION_KEY, "1");
  } else {
    sessionStorage.removeItem(GUEST_SESSION_KEY);
  }
}

export function isPremiumStatus(
  subscriptionStatus?: string | null,
  role?: string | null,
): boolean {
  if (role === "admin") return true;
  const status = subscriptionStatus ?? "free";
  return status === "premium" || status === "trial";
}

export function canAccessSection(
  section: HomeSectionKey,
  user: { role?: string; subscriptionStatus?: string } | null,
  isPremium: boolean,
): boolean {
  if (GUEST_SECTIONS.has(section)) return true;
  if (!user) return false;
  if (isPremium || user.role === "admin") return true;
  return false;
}

export function memberPathRequiresPremium(href: string): boolean {
  if (href === "/app/ai") return true;
  if (href.startsWith("/app/section/")) {
    const section = href.replace("/app/section/", "") as HomeSectionKey;
    return !GUEST_SECTIONS.has(section);
  }

  const premiumPrefixes = [
    "/app/search",
    "/app/forum",
    "/app/lessons",
    "/app/library",
    "/app/competitions",
    "/app/questions",
    "/app/calendars",
    "/app/self-diagnosis",
    "/app/diagnosis",
  ];

  return premiumPrefixes.some((prefix) => href === prefix || href.startsWith(`${prefix}/`));
}

export function memberPathAllowsGuest(href: string): boolean {
  if (href === "/app" || href === "/app/") return true;
  if (href === "/app/section/expert_corner") return true;
  if (href === "/app/privacy" || href === "/app/rules") return true;
  return false;
}

/** Public marketing URLs that should use member-app access control. */
export const PUBLIC_TO_MEMBER_REDIRECTS: Record<string, string> = {
  "/library": "/app/library",
  "/calendars": "/app/calendars",
  "/self-diagnosis": "/app/self-diagnosis",
  "/forum": "/app/forum",
  "/expert-qa": "/app/questions",
  "/competitions": "/app/competitions",
  "/diagnosis": "/app/diagnosis",
  "/lessons": "/app/lessons",
  "/chat": "/app/chat",
  "/care-plans": "/app/care-plans",
  "/grass-types": "/app/grass-types",
};

export function resolveMemberAccessRedirect(
  href: string,
  user: { role?: string } | null,
  isPremium: boolean,
): string | null {
  const guestBrowsing = !user && isGuestBrowseMode();

  if (!user && !memberPathAllowsGuest(href)) {
    return `/login?next=${encodeURIComponent(href)}`;
  }

  if (guestBrowsing && !memberPathAllowsGuest(href)) {
    return `/login?next=${encodeURIComponent(href)}`;
  }

  if (memberPathRequiresPremium(href) && !isPremium && user?.role !== "admin") {
    return user ? "/pricing" : `/login?next=${encodeURIComponent(href)}`;
  }

  return null;
}
