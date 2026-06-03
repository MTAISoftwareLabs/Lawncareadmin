import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { 
  Leaf, Settings, LayoutDashboard, LogOut, Users, 
  Menu, X, HelpCircle, BookOpen, Trophy, ShoppingBag,
  Play, Camera, Calendar, Star, MessageSquare, Bell, Image, Wrench,
  Home, Stethoscope, FileText, BellRing, BellOff, UserCog, CreditCard, Mail
} from "lucide-react";
import { Link, useLocation } from "wouter";
import logoUrl from "@assets/logo_1768933994269.jpeg";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useToast } from "@/hooks/use-toast";

const SCROLL_STORAGE_KEY = 'admin-sidebar-scroll';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const { toast } = useToast();
  const { isSupported, isSubscribed, subscribe, unsubscribe } = usePushNotifications();
  const [isToggling, setIsToggling] = useState(false);

  const handlePushToggle = async () => {
    setIsToggling(true);
    try {
      if (isSubscribed) {
        await unsubscribe();
        toast({ title: "Notifications disabled" });
      } else {
        await subscribe();
        toast({ title: "Notifications enabled", description: "You'll receive alerts when users send messages" });
      }
    } catch (error: any) {
      toast({ 
        title: "Failed to toggle notifications", 
        description: error.message || "Please try again",
        variant: "destructive" 
      });
    }
    setIsToggling(false);
  };

  // Restore scroll position on mount and location change
  useEffect(() => {
    const savedScroll = sessionStorage.getItem(SCROLL_STORAGE_KEY);
    if (navRef.current && savedScroll) {
      const scrollValue = parseInt(savedScroll, 10);
      if (!isNaN(scrollValue)) {
        requestAnimationFrame(() => {
          if (navRef.current) {
            navRef.current.scrollTop = scrollValue;
          }
        });
      }
    }
  }, [location]);

  // Save scroll position on scroll
  const handleScroll = () => {
    if (navRef.current) {
      sessionStorage.setItem(SCROLL_STORAGE_KEY, String(navRef.current.scrollTop));
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch (e) {
      console.error(e);
    }
    setLocation("/admin/login");
  };

  const handleNavClick = (path: string) => {
    setLocation(path);
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard, color: "from-blue-500 to-cyan-500", iconColor: "text-blue-500" },
    { label: "Users", path: "/admin/users", icon: Users, color: "from-violet-500 to-purple-500", iconColor: "text-violet-500" },
    { label: "Support Chat", path: "/admin/user-chats", icon: MessageSquare, color: "from-green-500 to-emerald-500", iconColor: "text-green-500" },
    { label: "Banners", path: "/admin/banners", icon: Image, color: "from-pink-500 to-rose-500", iconColor: "text-pink-500" },
    { label: "Home Content", path: "/admin/home-content", icon: Home, color: "from-amber-500 to-orange-500", iconColor: "text-amber-500" },
    { label: "Calendars", path: "/admin/calendars", icon: Calendar, color: "from-teal-500 to-cyan-500", iconColor: "text-teal-500" },
    { label: "Self Diagnosis", path: "/admin/self-diagnosis", icon: Stethoscope, color: "from-red-500 to-rose-500", iconColor: "text-red-500" },
    { label: "Lawn Library", path: "/admin/lawn-library", icon: BookOpen, color: "from-lime-500 to-green-500", iconColor: "text-lime-500" },
    { label: "Library", path: "/admin/library", icon: BookOpen, color: "from-indigo-500 to-violet-500", iconColor: "text-indigo-500" },
    { label: "Forum", path: "/admin/forum", icon: MessageSquare, color: "from-sky-500 to-blue-500", iconColor: "text-sky-500" },
    { label: "Push Notifications", path: "/admin/push-notifications", icon: Bell, color: "from-purple-500 to-fuchsia-500", iconColor: "text-purple-500" },
    { label: "Grass Types", path: "/admin/grass-types", icon: Leaf, color: "from-emerald-500 to-green-500", iconColor: "text-emerald-500" },
    { label: "Video Lessons", path: "/admin/lessons", icon: Play, color: "from-red-500 to-orange-500", iconColor: "text-red-500" },
    { label: "Care Plans", path: "/admin/plans", icon: Calendar, color: "from-blue-500 to-indigo-500", iconColor: "text-blue-500" },
    { label: "Deals", path: "/admin/deals", icon: ShoppingBag, color: "from-emerald-500 to-teal-500", iconColor: "text-emerald-500" },
    { label: "Competitions", path: "/admin/competitions", icon: Trophy, color: "from-yellow-500 to-amber-500", iconColor: "text-yellow-500" },
    { label: "Diagnoses", path: "/admin/diagnoses", icon: Camera, color: "from-cyan-500 to-blue-500", iconColor: "text-cyan-500" },
    { label: "Blog", path: "/admin/blog", icon: BookOpen, color: "from-orange-500 to-red-500", iconColor: "text-orange-500" },
    { label: "FAQs", path: "/admin/faqs", icon: HelpCircle, color: "from-fuchsia-500 to-pink-500", iconColor: "text-fuchsia-500" },
    { label: "Testimonials", path: "/admin/testimonials", icon: Star, color: "from-yellow-400 to-orange-500", iconColor: "text-yellow-500" },
    { label: "Static Pages", path: "/admin/pages", icon: FileText, color: "from-slate-500 to-gray-600", iconColor: "text-slate-500" },
    { label: "Privacy Content", path: "/admin/privacy-content", icon: FileText, color: "from-indigo-500 to-blue-600", iconColor: "text-indigo-500" },
    { label: "Config", path: "/admin/config", icon: Wrench, color: "from-zinc-500 to-slate-600", iconColor: "text-zinc-500" },
    { label: "Email / SMTP", path: "/admin/email-settings", icon: Mail, color: "from-blue-500 to-indigo-600", iconColor: "text-blue-500" },
    { label: "RevenueCat", path: "/admin/revenuecat", icon: CreditCard, color: "from-purple-500 to-pink-600", iconColor: "text-purple-500" },
    { label: "Settings", path: "/admin/settings", icon: Settings, color: "from-gray-500 to-slate-600", iconColor: "text-gray-500" },
    { label: "My Profile", path: "/admin/profile", icon: UserCog, color: "from-emerald-500 to-green-600", iconColor: "text-emerald-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 p-4 z-50 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <img src={logoUrl} alt="Lawncare Workshop" className="w-8 h-8 rounded-full object-cover ring-2 ring-white/50" />
          <div>
            <h2 className="text-lg font-bold text-white">Lawncare Workshop</h2>
            <p className="text-xs text-white/80">Admin Panel</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          data-testid="button-mobile-menu-toggle"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      <div className="flex pt-16 lg:pt-0">
        {/* Sidebar */}
        <aside 
          className={`
            fixed top-16 lg:top-0 left-0 bottom-0
            w-64 bg-background border-r border-border h-screen flex flex-col
            transition-transform duration-300 ease-in-out z-40
            lg:sticky lg:bg-card
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
          style={{ backgroundColor: 'hsl(var(--background))' }}
        >
          {/* Desktop Header */}
          <div className="hidden lg:flex p-6 border-b border-border items-center gap-3 bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500">
            <img src={logoUrl} alt="Lawncare Workshop" className="w-12 h-12 rounded-full object-cover ring-2 ring-white/50 shadow-lg" />
            <div>
              <h2 className="text-xl font-bold text-white">Lawncare</h2>
              <p className="text-xs text-white/80">Admin Panel</p>
            </div>
          </div>

          {/* Navigation */}
          <nav ref={navRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = location === item.path;
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => handleNavClick(item.path)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                        transition-all duration-200
                        ${isActive 
                          ? `bg-gradient-to-r ${item.color} text-white shadow-lg` 
                          : 'text-muted-foreground hover-elevate active-elevate-2'
                        }
                      `}
                      data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : item.iconColor}`} />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border space-y-2">
            {isSupported && (
              <Button 
                variant="ghost" 
                className={`w-full justify-start ${isSubscribed ? 'text-green-600' : 'text-muted-foreground'}`}
                size="sm"
                onClick={handlePushToggle}
                disabled={isToggling}
                data-testid="button-push-toggle"
              >
                {isSubscribed ? (
                  <BellRing className="w-4 h-4 mr-2 text-green-500" />
                ) : (
                  <BellOff className="w-4 h-4 mr-2" />
                )}
                {isToggling ? "..." : isSubscribed ? "Notifications On" : "Enable Notifications"}
              </Button>
            )}
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start text-emerald-600" size="sm">
                <Leaf className="w-4 h-4 mr-2 text-emerald-500" />
                View Site
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-500" 
              size="sm"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:ml-0 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
