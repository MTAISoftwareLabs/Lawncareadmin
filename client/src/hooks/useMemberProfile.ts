import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

export interface MemberProfile {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  zipCode?: string | null;
  isNotificationEnabled?: boolean;
  subscriptionStatus?: string;
}

export function useMemberProfile() {
  const { isAuthenticated } = useAuth();

  return useQuery<MemberProfile>({
    queryKey: ["/api/user/profile"],
    enabled: isAuthenticated,
    queryFn: async () => {
      const response = await fetch("/api/user/profile", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to load profile");
      const json = await response.json();
      return json.data as MemberProfile;
    },
  });
}
