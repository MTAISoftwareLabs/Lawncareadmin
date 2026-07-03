import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Crown, Lock } from "lucide-react";

interface PremiumPaywallProps {
  title?: string;
  description?: string;
}

export function PremiumPaywall({
  title = "Premium feature",
  description = "Subscribe to unlock this feature — same membership as the iOS and Android apps.",
}: PremiumPaywallProps) {
  return (
    <Card className="p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
        <Crown className="h-7 w-7 text-amber-600" />
      </div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mx-auto mt-2 max-w-md text-muted-foreground">{description}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/pricing">
          <Button>View plans & start trial</Button>
        </Link>
        <Link href="/app">
          <Button variant="outline">Back to home</Button>
        </Link>
      </div>
    </Card>
  );
}

export function PremiumFeatureBanner({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="relative min-h-[140px] overflow-hidden border-dashed">
      <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-emerald-700/30" />
      <div className="relative flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
        <Lock className="h-6 w-6 text-green-700 dark:text-green-300" />
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
        <Link href="/pricing">
          <Button size="sm" variant="outline" className="mt-1 border-green-600 text-green-700">
            Subscribe to unlock
          </Button>
        </Link>
      </div>
    </Card>
  );
}
