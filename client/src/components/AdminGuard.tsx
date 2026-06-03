import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { api } from "@/lib/api";
import { useEffect } from "react";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["user"],
    queryFn: api.auth.me,
    retry: false,
  });

  useEffect(() => {
    if (!isLoading) {
      if (!user || error) {
        setLocation("/admin/login");
      } else if (user.user?.role !== "admin") {
        alert("Access denied. Admin privileges required.");
        setLocation("/");
      }
    }
  }, [user, isLoading, error, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user || user.user?.role !== "admin") {
    return null;
  }

  return <>{children}</>;
}
