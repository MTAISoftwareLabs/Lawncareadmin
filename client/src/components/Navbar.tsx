import { Link } from "wouter";
import { ShoppingCart, User, Menu, Heart, Package } from "lucide-react";
import { Button } from "./ui/button";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { SearchBar } from "./SearchBar";
import logoUrl from "@assets/logo_1768933994269.jpeg";

export function Navbar() {
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: api.auth.me,
    retry: false,
  });

  const { data: cart } = useQuery({
    queryKey: ["cart"],
    queryFn: api.cart.get,
    enabled: !!user,
  });

  const cartCount = cart?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center space-x-3 flex-shrink-0">
            <img src={logoUrl} alt="Lawncare Workshop" className="h-10 w-10 rounded-full object-cover" />
            <span className="text-2xl font-bold hidden sm:inline">Lawncare Workshop</span>
          </Link>

          <div className="flex-1 max-w-2xl hidden md:block">
            <SearchBar />
          </div>

          <nav className="hidden lg:flex items-center space-x-3 flex-shrink-0">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-green-100">
              Home
            </Link>
            <Link href="/lessons" className="text-sm font-medium transition-colors hover:text-green-100" data-testid="link-lessons">
              Lessons
            </Link>
            <Link href="/care-plans" className="text-sm font-medium transition-colors hover:text-green-100" data-testid="link-care-plans">
              Plans
            </Link>
            <Link href="/forum" className="text-sm font-medium transition-colors hover:text-green-100" data-testid="link-forum">
              Forum
            </Link>
            <Link href="/grass-types" className="text-sm font-medium transition-colors hover:text-green-100" data-testid="link-grass-types">
              Grass
            </Link>
            <Link href="/deals" className="text-sm font-medium transition-colors hover:text-green-100" data-testid="link-deals">
              Deals
            </Link>
            <Link href="/library" className="text-sm font-medium transition-colors hover:text-green-100" data-testid="link-library">
              Library
            </Link>
            <Link href="/calendars" className="text-sm font-medium transition-colors hover:text-green-100" data-testid="link-calendars">
              Calendars
            </Link>
            <Link href="/self-diagnosis" className="text-sm font-medium transition-colors hover:text-green-100" data-testid="link-self-diagnosis">
              Diagnose
            </Link>
            {user && (
              <Link href="/chat" className="text-sm font-medium transition-colors hover:text-green-100" data-testid="link-chat">
                Chat
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-2 flex-shrink-0">
          {user && (
            <>
              <Link href="/wishlist">
                <Button variant="ghost" size="sm" className="text-white hover:text-green-100 hover:bg-green-600" data-testid="button-wishlist">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/orders">
                <Button variant="ghost" size="sm" className="text-white hover:text-green-100 hover:bg-green-600" data-testid="button-orders">
                  <Package className="h-5 w-5" />
                </Button>
              </Link>
            </>
          )}
          <Link href="/cart">
            <Button variant="ghost" size="sm" className="relative text-white hover:text-green-100 hover:bg-green-600" data-testid="button-cart">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-white text-xs text-green-600 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>

          {user ? (
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="text-white hover:text-green-100 hover:bg-green-600">
                <User className="h-5 w-5 mr-2" />
                {user.user?.name}
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button size="sm" className="bg-white text-green-600 hover:bg-green-50">Login</Button>
            </Link>
          )}

            <Button variant="ghost" size="sm" className="md:hidden text-white hover:text-green-100 hover:bg-green-600">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="md:hidden mt-3">
          <SearchBar />
        </div>
      </div>
    </header>
  );
}
