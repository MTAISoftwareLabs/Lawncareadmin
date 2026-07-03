import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface MemberGuardProps {
  children: ReactNode;
  /** Allow browsing without login (Start Here, member home, etc.) */
  guestAllowed?: boolean;
}

export function MemberGuard({ children, guestAllowed = false }: MemberGuardProps) {
  const [location, setLocation] = useLocation();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!guestAllowed && !isLoading && !user) {
      const next = encodeURIComponent(location);
      setLocation(`/login?next=${next}`);
    }
  }, [isLoading, user, setLocation, guestAllowed, location]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!guestAllowed && !user) return null;

  return <>{children}</>;
}
