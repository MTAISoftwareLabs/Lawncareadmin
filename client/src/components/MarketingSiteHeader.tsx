import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";

interface MarketingSiteHeaderProps {
  user?: boolean;
}

export function MarketingSiteHeader({ user }: MarketingSiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <Leaf className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Lawncare Workshop</span>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/app">
                <Button variant="ghost">Open App</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Log In</Button>
                </Link>
                <Link href="/signup">
                  <Button>Start Free Trial</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
