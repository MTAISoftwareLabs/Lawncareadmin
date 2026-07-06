import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Leaf, Star, Crown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";

interface StripePlan {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: string;
  currency?: string | null;
  intervalType: string;
  trialDays?: number | null;
  stripePriceId: string | null;
  features?: string | null;
  displayOrder?: number | null;
}

function parseFeatures(features?: string | null): string[] {
  if (!features) return [];
  try {
    const parsed = JSON.parse(features);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return features.split("\n").map((line) => line.trim()).filter(Boolean);
  }
}

function formatMoney(amount: string, currency = "USD") {
  const value = Number(amount);
  if (Number.isNaN(value)) return amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value);
}

export default function PricingPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { isPremium } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string>("yearly");

  const { data: stripeConfig } = useQuery<{ enabled: boolean; publishableKey?: string | null }>({
    queryKey: ["/api/stripe/config"],
  });

  const { data: plans = [], isLoading: plansLoading } = useQuery<StripePlan[]>({
    queryKey: ["/api/stripe/plans"],
  });

  const sortedPlans = useMemo(
    () => [...plans].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)),
    [plans],
  );

  const selectedPlan = sortedPlans.find((plan) => plan.slug === selectedSlug) ?? sortedPlans[0];
  const stripeEnabled = stripeConfig?.enabled && sortedPlans.some((plan) => plan.stripePriceId);

  const startCheckout = async (plan: StripePlan) => {
    if (!isAuthenticated) {
      navigate("/signup?next=/pricing");
      return;
    }

    if (!plan.stripePriceId) {
      toast({
        title: "Plan unavailable",
        description: "This plan is not configured for web checkout yet.",
        variant: "destructive",
      });
      return;
    }

    if (!stripeEnabled) {
      toast({
        title: "Payments unavailable",
        description: "Stripe is not configured on this server. Add your Stripe keys to enable checkout.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const origin = window.location.origin;
      const response = await apiRequest("/api/stripe/create-checkout", {
        method: "POST",
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          successUrl: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${origin}/pricing`,
        }),
      });

      if (response.url) {
        window.location.href = response.url;
        return;
      }

      throw new Error("Stripe checkout URL was not returned");
    } catch (error) {
      toast({
        title: "Checkout failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const openBillingPortal = async () => {
    setIsProcessing(true);
    try {
      const response = await apiRequest("/api/stripe/create-portal", {
        method: "POST",
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/app/profile`,
        }),
      });

      if (response.url) {
        window.location.href = response.url;
        return;
      }

      throw new Error("Billing portal URL was not returned");
    } catch (error) {
      toast({
        title: "Unable to open billing portal",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const freeFeatures = [
    "Start Here! expert content",
    "Member deals",
    "Community access",
    "Monthly newsletter",
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between gap-4">
          <button onClick={() => navigate("/")} className="flex items-center gap-2" data-testid="link-home">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Leaf className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground">Lawncare Workshop</span>
          </button>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Button variant="outline" onClick={() => navigate("/app")} data-testid="button-dashboard">
                Open app
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/login?next=/pricing")} data-testid="button-login">
                  Log In
                </Button>
                <Button onClick={() => navigate("/signup?next=/pricing")} data-testid="button-signup">
                  Start free
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container py-12">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-4">
            <Crown className="mr-1 h-3 w-3" />
            Premium membership
          </Badge>
          <h1 className="mb-4 text-4xl font-bold tracking-tight">Unlock your lawn&apos;s full potential</h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Same premium content as the mobile app — one membership, every platform. Start with a 7-day free trial on
            web checkout.
          </p>

          {!stripeEnabled && (
            <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Web checkout requires Stripe keys on the server. Mobile subscribers can sign in with the same account.
            </div>
          )}

          {sortedPlans.length > 1 && (
            <div className="mb-12 inline-flex rounded-lg bg-muted p-1">
              {sortedPlans.map((plan) => (
                <button
                  key={plan.slug}
                  onClick={() => setSelectedSlug(plan.slug)}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    selectedSlug === plan.slug
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`button-plan-${plan.slug}`}
                >
                  {plan.name}
                  {plan.slug === "yearly" && (
                    <Badge variant="default" className="ml-2 text-xs">
                      Save 25%
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          <Card className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-muted-foreground" />
                Free
              </CardTitle>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">$0</span>
                <span className="text-muted-foreground">/forever</span>
              </div>
              <CardDescription>Get started with core member features</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {freeFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-muted-foreground" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(isAuthenticated ? "/app" : "/signup")}
                data-testid="button-free-plan"
              >
                {isAuthenticated ? "Current free access" : "Get started"}
              </Button>
            </CardFooter>
          </Card>

          {plansLoading ? (
            <Card className="md:col-span-2">
              <CardContent className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </CardContent>
            </Card>
          ) : (
            sortedPlans.map((plan) => {
              const features = parseFeatures(plan.features);
              const isPopular = plan.slug === "yearly";
              const isCurrent = isPremium && user?.subscriptionPlan === plan.slug;

              return (
                <Card key={plan.slug} className={`relative ${isPopular ? "border-primary shadow-lg" : ""}`}>
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        <Star className="mr-1 h-3 w-3" />
                        Most popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className={`h-5 w-5 ${isPopular ? "text-primary" : "text-muted-foreground"}`} />
                      {plan.name}
                    </CardTitle>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">{formatMoney(plan.price, plan.currency ?? "USD")}</span>
                      <span className="text-muted-foreground">/{plan.intervalType}</span>
                    </div>
                    {plan.description && <CardDescription>{plan.description}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    {isPremium ? (
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={openBillingPortal}
                        disabled={isProcessing}
                        data-testid={`button-manage-${plan.slug}`}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Opening portal...
                          </>
                        ) : isCurrent ? (
                          "Manage billing"
                        ) : (
                          "Manage subscription"
                        )}
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        variant={isPopular ? "default" : "outline"}
                        onClick={() => startCheckout(plan)}
                        disabled={isProcessing || !plan.stripePriceId}
                        data-testid={`button-subscribe-${plan.slug}`}
                      >
                        {isProcessing && selectedPlan?.slug === plan.slug ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Redirecting to Stripe...
                          </>
                        ) : (
                          "Subscribe"
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })
          )}
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Frequently asked questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold">Does web membership work with the mobile app?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes. Sign in with the same email on iOS/Android. Mobile purchases through the App Store use Apple
                  billing; web purchases use Stripe — both unlock the same premium content.
                </p>
              </div>
              <div>
                <h3 className="font-semibold">How do I cancel?</h3>
                <p className="text-sm text-muted-foreground">
                  Premium members can open the Stripe billing portal from this page or from profile settings in the member
                  app.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
