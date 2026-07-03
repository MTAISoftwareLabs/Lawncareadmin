import { useLocation } from "wouter";
import { useAuth } from "./useAuth";
import { useSubscription } from "./useSubscription";
import { canAccessSection, resolveMemberAccessRedirect } from "@/lib/premiumAccess";
import type { HomeSectionKey } from "@/lib/memberHome";

export function useMemberAccess() {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const [, setLocation] = useLocation();

  const navigateMember = (href: string) => {
    const redirect = resolveMemberAccessRedirect(href, user, isPremium);
    if (redirect) {
      setLocation(redirect);
      return false;
    }
    setLocation(href);
    return true;
  };

  const canOpenSection = (section: HomeSectionKey) =>
    canAccessSection(section, user, isPremium);

  const redirectIfSectionDenied = (section: HomeSectionKey) => {
    if (canOpenSection(section)) return false;
    if (!user) {
      setLocation(`/login?next=/app/section/${section}`);
      return true;
    }
    setLocation("/pricing");
    return true;
  };

  return {
    user,
    isPremium,
    navigateMember,
    canOpenSection,
    redirectIfSectionDenied,
  };
}
