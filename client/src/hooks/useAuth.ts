import { useQuery } from "@tanstack/react-query";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role?: string;
  subscriptionStatus?: string;
  subscriptionPlan?: string | null;
}

export function useAuth() {
  const query = useQuery<{ user: AuthUser }>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  return {
    user: query.data?.user ?? null,
    isLoading: query.isLoading,
    isAuthenticated: !!query.data?.user,
    refetch: query.refetch,
  };
}
