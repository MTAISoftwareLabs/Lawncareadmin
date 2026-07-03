import { useAuth } from "./useAuth";
import { isPremiumStatus } from "@/lib/premiumAccess";

export function useSubscription() {
  const { user } = useAuth();

  const isPremium = isPremiumStatus(user?.subscriptionStatus, user?.role);

  return {
    isPremium,
    isAdmin: user?.role === "admin",
    status: user?.subscriptionStatus ?? "free",
    requiresPremium: (featureIsPremium: boolean) => !featureIsPremium || isPremium,
  };
}
