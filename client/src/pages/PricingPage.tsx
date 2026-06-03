import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Leaf, Star, Crown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function PricingPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: user } = useQuery<{ id: number; name: string; email: string; subscriptionStatus: string }>({
    queryKey: ["/api/auth/me"],
  });

  const subscribeMutation = useMutation({
    mutationFn: async (plan: string) => {
      return apiRequest("/api/subscriptions/create", {
        method: "POST",
        body: JSON.stringify({ plan }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Subscription Activated",
        description: "Welcome to Lawncare Workshop Premium! Enjoy full access to all features.",
      });
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription Failed",
        description: error.message || "Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = async (plan: "monthly" | "yearly") => {
    if (!user) {
      navigate("/signup");
      return;
    }

    if (user.subscriptionStatus === "premium") {
      toast({
        title: "Already Subscribed",
        description: "You already have an active premium subscription.",
      });
      return;
    }

    setIsProcessing(true);
    try {
      await subscribeMutation.mutateAsync(plan);
    } finally {
      setIsProcessing(false);
    }
  };

  const plans = [
    {
      id: "monthly",
      name: "Monthly",
      price: "$9.99",
      period: "/month",
      description: "Perfect for trying out all premium features",
      features: [
        "Personalized lawn care plans",
        "All video lessons library",
        "AI-powered lawn diagnosis",
        "Expert Q&A access",
        "Monthly competition entry",
        "Exclusive deals & discounts",
        "Cancel anytime",
      ],
      popular: false,
    },
    {
      id: "yearly",
      name: "Yearly",
      price: "$89.99",
      period: "/year",
      description: "Best value - save over 25%",
      originalPrice: "$119.88",
      savings: "Save $29.89",
      features: [
        "Everything in Monthly",
        "2 months FREE",
        "Priority expert support",
        "Early access to new features",
        "Exclusive seasonal guides",
        "VIP competition perks",
        "Best value guarantee",
      ],
      popular: true,
    },
  ];

  const freeFeatures = [
    "Basic lawn care tips",
    "Limited video previews",
    "Community Q&A access",
    "Monthly newsletter",
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between gap-4">
          <button 
            onClick={() => navigate("/")} 
            className="flex items-center gap-2"
            data-testid="link-home"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Leaf className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground">Lawncare Workshop</span>
          </button>
          <div className="flex items-center gap-2">
            {user ? (
              <Button variant="outline" onClick={() => navigate("/dashboard")} data-testid="button-dashboard">
                Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/login")} data-testid="button-login">
                  Log In
                </Button>
                <Button onClick={() => navigate("/signup")} data-testid="button-signup">
                  Start Free Trial
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
            Premium Membership
          </Badge>
          <h1 className="mb-4 text-4xl font-bold tracking-tight">
            Unlock Your Lawn's Full Potential
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Get personalized guidance from a golf course superintendent with 30+ years of experience.
            Start your 7-day free trial today.
          </p>

          <div className="mb-12 inline-flex rounded-lg bg-muted p-1">
            <button
              onClick={() => setSelectedPlan("monthly")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                selectedPlan === "monthly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="button-plan-monthly"
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedPlan("yearly")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                selectedPlan === "yearly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="button-plan-yearly"
            >
              Yearly
              <Badge variant="default" className="ml-2 text-xs">
                Save 25%
              </Badge>
            </button>
          </div>
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
              <CardDescription>Get started with basic features</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {freeFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
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
                onClick={() => navigate(user ? "/dashboard" : "/signup")}
                data-testid="button-free-plan"
              >
                {user ? "Current Plan" : "Get Started"}
              </Button>
            </CardFooter>
          </Card>

          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? "border-primary shadow-lg" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Star className="mr-1 h-3 w-3" />
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className={`h-5 w-5 ${plan.popular ? "text-primary" : "text-muted-foreground"}`} />
                  {plan.name}
                </CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                {plan.originalPrice && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground line-through">{plan.originalPrice}</span>
                    <Badge variant="secondary" className="text-xs">{plan.savings}</Badge>
                  </div>
                )}
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleSubscribe(plan.id as "monthly" | "yearly")}
                  disabled={isProcessing || user?.subscriptionStatus === "premium"}
                  data-testid={`button-subscribe-${plan.id}`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : user?.subscriptionStatus === "premium" ? (
                    "Current Plan"
                  ) : (
                    "Start 7-Day Free Trial"
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold">How does the 7-day free trial work?</h3>
                <p className="text-sm text-muted-foreground">
                  Start your trial with full access to all premium features. You won't be charged until after 7 days. 
                  Cancel anytime during the trial period at no cost.
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Can I switch between monthly and yearly plans?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes! You can upgrade to yearly at any time and we'll prorate your existing subscription. 
                  The yearly plan saves you over 25% compared to monthly billing.
                </p>
              </div>
              <div>
                <h3 className="font-semibold">What's included in the AI lawn diagnosis?</h3>
                <p className="text-sm text-muted-foreground">
                  Upload photos of your lawn or plants and get instant analysis of health issues, 
                  diseases, pests, and personalized treatment recommendations from our AI system, 
                  reviewed by our expert team.
                </p>
              </div>
              <div>
                <h3 className="font-semibold">How do I cancel my subscription?</h3>
                <p className="text-sm text-muted-foreground">
                  You can cancel anytime from your account settings. Your premium access will continue 
                  until the end of your current billing period with no additional charges.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            Questions? Contact us at{" "}
            <a href="mailto:support@lawncareworkshop.com" className="text-primary hover:underline">
              support@lawncareworkshop.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
