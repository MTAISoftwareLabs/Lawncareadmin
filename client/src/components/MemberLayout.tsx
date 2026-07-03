import { Link, useLocation } from "wouter";
import { ReactNode, useEffect } from "react";
import {
  Home,
  Search,
  MessagesSquare,
  HelpCircle,
  Trophy,
  User,
  LogOut,
  Crown,
  Leaf,
  LogIn,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useTheme } from "@/hooks/useTheme";
import { resolveMemberAccessRedirect, setGuestBrowseMode } from "@/lib/premiumAccess";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { NotificationBell } from "@/components/member/NotificationBell";
import logoUrl from "@assets/logo_1768933994269.jpeg";

const NAV_ITEMS = [
  { href: "/app", label: "Home", icon: Home, authRequired: false, premiumRequired: false, match: (path: string) => path === "/app" || path === "/app/" },
  { href: "/app/search", label: "Search", icon: Search, authRequired: true, premiumRequired: true, match: (path: string) => path === "/app/search" },
  { href: "/app/forum", label: "Forum", icon: MessagesSquare, authRequired: true, premiumRequired: true, match: (path: string) => path === "/app/forum" || path === "/forum" },
  { href: "/app/questions", label: "Questions", icon: HelpCircle, authRequired: true, premiumRequired: true, match: (path: string) => path === "/app/questions" || path === "/expert-qa" },
  { href: "/app/competitions", label: "Contest", icon: Trophy, authRequired: true, premiumRequired: true, match: (path: string) => path === "/app/competitions" || path === "/competitions" },
  { href: "/app/profile", label: "Profile", icon: User, authRequired: true, premiumRequired: false, match: (path: string) => path === "/app/profile" || path.startsWith("/app/settings") || path === "/profile" },
];

interface MemberLayoutProps {
  children: ReactNode;
}

export function MemberLayout({ children }: MemberLayoutProps) {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();
  const { isPremium } = useSubscription();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = async () => {
    setGuestBrowseMode(false);
    await api.auth.logout();
    queryClient.clear();
    setLocation("/");
  };

  useEffect(() => {
    if (authLoading || !location.startsWith("/app")) return;
    const redirect = resolveMemberAccessRedirect(location, user, isPremium);
    if (redirect && redirect !== location) {
      setLocation(redirect);
    }
  }, [location, user, isPremium, authLoading, setLocation]);

  const handleNav = (href: string, authRequired: boolean, premiumRequired: boolean) => {
    const redirect = resolveMemberAccessRedirect(href, user, isPremium);
    if (redirect) {
      setLocation(redirect);
      return;
    }
    if (authRequired && !user) {
      setLocation(`/login?next=${encodeURIComponent(href)}`);
      return;
    }
    if (premiumRequired && !isPremium) {
      setLocation(user ? "/pricing" : `/login?next=${encodeURIComponent(href)}`);
      return;
    }
    setLocation(href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur-md dark:bg-gray-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/app" className="flex items-center gap-3">
            <img src={logoUrl} alt="Lawncare Workshop" className="h-10 w-10 rounded-full object-cover" />
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-green-900 dark:text-green-100">The Lawncare Workshop</p>
              <p className="text-xs text-muted-foreground">Member workspace</p>
            </div>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            {user && <NotificationBell />}
            <Button size="sm" variant="ghost" onClick={toggleTheme} aria-label="Toggle theme">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {user && isPremium ? (
              <Badge className="hidden bg-amber-100 text-amber-800 hover:bg-amber-100 sm:inline-flex">
                <Crown className="mr-1 h-3 w-3" />
                Premium
              </Badge>
            ) : user ? (
              <Link href="/pricing">
                <Button size="sm" variant="outline" className="hidden border-green-600 text-green-700 sm:inline-flex">
                  Upgrade
                </Button>
              </Link>
            ) : (
              <Link href="/login?next=/app">
                <Button size="sm" variant="outline" className="border-green-600 text-green-700">
                  <LogIn className="mr-1 h-4 w-4" />
                  Sign in
                </Button>
              </Link>
            )}
            <Link href="/">
              <Button size="sm" variant="ghost" className="hidden md:inline-flex">
                Marketing site
              </Button>
            </Link>
            {user && (
              <Button size="sm" variant="ghost" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <aside className="hidden w-56 shrink-0 lg:block">
          <nav className="sticky top-24 space-y-1 rounded-2xl border bg-white p-3 shadow-sm dark:bg-gray-900">
            {NAV_ITEMS.map((item) => {
              const active = item.match(location);
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => handleNav(item.href, item.authRequired, item.premiumRequired)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    active
                      ? "bg-green-600 text-white"
                      : "text-gray-700 hover:bg-green-50 hover:text-green-800 dark:text-gray-200 dark:hover:bg-green-950"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-4 rounded-2xl border bg-white p-4 text-sm text-muted-foreground shadow-sm dark:bg-gray-900">
            <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
              <Leaf className="h-4 w-4 text-green-600" />
              One CMS, every platform
            </div>
            Content you manage in the admin dashboard appears here and in the mobile app automatically.
          </div>
        </aside>

        <main className="min-w-0 flex-1 pb-24 lg:pb-6">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 backdrop-blur-md dark:bg-gray-950/95 lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-6 gap-1 px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const active = item.match(location);
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => handleNav(item.href, item.authRequired, item.premiumRequired)}
                className={`flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10px] font-medium ${active ? "text-green-700" : "text-gray-500"}`}
              >
                <Icon className={`h-5 w-5 ${active ? "text-green-600" : ""}`} />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
