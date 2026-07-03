import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function NotificationBell() {
  const { user } = useAuth();

  const { data } = useQuery<{ data?: unknown[] }>({
    queryKey: ["/api/notifications"],
    enabled: !!user,
    refetchInterval: 60000,
  });

  if (!user) return null;

  const count = data?.data?.length ?? 0;

  return (
    <Link href="/app/notifications">
      <Button size="sm" variant="ghost" className="relative" aria-label="Notifications">
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </Button>
    </Link>
  );
}
