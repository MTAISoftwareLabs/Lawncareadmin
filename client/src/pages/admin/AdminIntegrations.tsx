import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Bot,
  CheckCircle2,
  Cloud,
  CreditCard,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Send,
  Settings,
  Wrench,
  XCircle,
  Bell,
} from "lucide-react";

interface IntegrationMeta {
  configured: boolean;
  source: "admin_panel" | "environment" | "none";
}

interface WeatherSettings extends IntegrationMeta {
  weather_api_key: string;
}

interface StripeSettings extends IntegrationMeta {
  stripe_secret_key: string;
  stripe_publishable_key: string;
  stripe_webhook_secret: string;
  stripe_monthly_price_id: string;
  stripe_yearly_price_id: string;
}

function SecretInput({
  label,
  value,
  onChange,
  placeholder,
  configured,
  testId,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  configured?: boolean;
  testId?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label}
        {configured && " (leave blank to keep current)"}
      </label>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={value === "(configured)" ? "" : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={configured ? "••••••••" : placeholder}
          className="pr-10"
          data-testid={testId}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ configured, source }: { configured: boolean; source?: string }) {
  if (configured) {
    return (
      <span className="inline-flex items-center gap-1 text-sm text-green-700">
        <CheckCircle2 className="h-4 w-4" />
        Configured
        {source === "environment" && (
          <span className="text-xs text-muted-foreground">(from server env)</span>
        )}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-sm text-amber-700">
      <XCircle className="h-4 w-4" />
      Not configured
    </span>
  );
}

function AdminIntegrationsContent() {
  const { toast } = useToast();

  const [weatherForm, setWeatherForm] = useState({ weather_api_key: "" });
  const [stripeForm, setStripeForm] = useState({
    stripe_secret_key: "",
    stripe_publishable_key: "",
    stripe_webhook_secret: "",
    stripe_monthly_price_id: "",
    stripe_yearly_price_id: "",
  });
  const [weatherTestResult, setWeatherTestResult] = useState("");

  const { data: weatherSettings, isLoading: weatherLoading } = useQuery<WeatherSettings>({
    queryKey: ["/api/admin/weather-settings"],
  });

  const { data: stripeSettings, isLoading: stripeLoading } = useQuery<StripeSettings>({
    queryKey: ["/api/admin/stripe-settings"],
  });

  useEffect(() => {
    if (weatherSettings) {
      setWeatherForm({ weather_api_key: weatherSettings.weather_api_key || "" });
    }
  }, [weatherSettings]);

  useEffect(() => {
    if (stripeSettings) {
      setStripeForm({
        stripe_secret_key: stripeSettings.stripe_secret_key || "",
        stripe_publishable_key: stripeSettings.stripe_publishable_key || "",
        stripe_webhook_secret: stripeSettings.stripe_webhook_secret || "",
        stripe_monthly_price_id: stripeSettings.stripe_monthly_price_id || "",
        stripe_yearly_price_id: stripeSettings.stripe_yearly_price_id || "",
      });
    }
  }, [stripeSettings]);

  const saveWeatherMutation = useMutation({
    mutationFn: (payload: typeof weatherForm) =>
      apiRequest("/api/admin/weather-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/weather-settings"] });
      toast({ title: "Saved", description: "Weather API settings updated." });
    },
    onError: () => toast({ title: "Error", description: "Failed to save weather settings.", variant: "destructive" }),
  });

  const testWeatherMutation = useMutation({
    mutationFn: () =>
      apiRequest("/api/admin/weather-settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "90210" }),
      }),
    onSuccess: (res: any) => {
      const loc = res?.data?.location;
      const temp = res?.data?.temp_f;
      setWeatherTestResult(
        loc ? `${loc}: ${temp}°F — ${res?.data?.condition || "OK"}` : res?.message || "Connection successful",
      );
      toast({ title: "Weather API test successful" });
    },
    onError: (err: any) => {
      setWeatherTestResult("");
      toast({ title: "Test failed", description: err?.message, variant: "destructive" });
    },
  });

  const saveStripeMutation = useMutation({
    mutationFn: (payload: typeof stripeForm) =>
      apiRequest("/api/admin/stripe-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stripe-settings"] });
      toast({ title: "Saved", description: "Stripe settings updated." });
    },
    onError: () => toast({ title: "Error", description: "Failed to save Stripe settings.", variant: "destructive" }),
  });

  const testStripeMutation = useMutation({
    mutationFn: () =>
      apiRequest("/api/admin/stripe-settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }),
    onSuccess: () => toast({ title: "Stripe test successful" }),
    onError: (err: any) =>
      toast({ title: "Stripe test failed", description: err?.message, variant: "destructive" }),
  });

  if (weatherLoading || stripeLoading) {
    return (
      <AdminLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      </AdminLayout>
    );
  }

  const hubLinks = [
    {
      title: "OpenAI / AI Turf Talk",
      description: "API key for mobile AI chat and text refinement",
      href: "/admin/settings",
      icon: Bot,
      note: "Settings → AI / OpenAI tab",
    },
    {
      title: "Email / SMTP",
      description: "Password reset and transactional email",
      href: "/admin/email-settings",
      icon: Mail,
    },
    {
      title: "RevenueCat",
      description: "Mobile in-app purchase webhooks and API",
      href: "/admin/revenuecat",
      icon: CreditCard,
    },
    {
      title: "Firebase & push",
      description: "FCM keys, web push, and notification config",
      href: "/admin/push-notifications",
      icon: Bell,
    },
    {
      title: "Advanced config",
      description: "Raw key-value store for other integration keys",
      href: "/admin/config",
      icon: Wrench,
    },
    {
      title: "Site settings",
      description: "Landing page branding and admin password",
      href: "/admin/settings",
      icon: Settings,
    },
  ];

  return (
    <AdminLayout>
      <div className="mx-auto max-w-4xl space-y-8 p-6 md:p-8">
        <div>
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="mt-2 text-muted-foreground">
            Manage all third-party API keys from the admin panel. Database settings override server environment variables.
          </p>
        </div>

        <Tabs defaultValue="weather" className="w-full">
          <TabsList className="mb-6 flex flex-wrap h-auto gap-1">
            <TabsTrigger value="weather">
              <Cloud className="mr-2 h-4 w-4" />
              Weather
            </TabsTrigger>
            <TabsTrigger value="stripe">
              <CreditCard className="mr-2 h-4 w-4" />
              Stripe
            </TabsTrigger>
            <TabsTrigger value="more">More integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="weather">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2">
                    <Cloud className="h-5 w-5 text-sky-600" />
                    WeatherAPI.com
                  </span>
                  <StatusBadge configured={!!weatherSettings?.configured} source={weatherSettings?.source} />
                </CardTitle>
                <CardDescription>
                  Powers weather and soil-temperature banners on the member web app and mobile home screen.
                  Get a free key at{" "}
                  <a href="https://www.weatherapi.com/" target="_blank" rel="noopener noreferrer" className="text-green-700 underline">
                    weatherapi.com
                  </a>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveWeatherMutation.mutate(weatherForm);
                  }}
                  className="space-y-4"
                >
                  <SecretInput
                    label="Weather API Key"
                    value={weatherForm.weather_api_key}
                    onChange={(v) => setWeatherForm({ weather_api_key: v })}
                    configured={weatherSettings?.weather_api_key === "(configured)"}
                    placeholder="Your WeatherAPI key"
                    testId="input-weather-api-key"
                  />
                  <div className="flex gap-2">
                    <Button type="submit" disabled={saveWeatherMutation.isPending}>
                      {saveWeatherMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={testWeatherMutation.isPending || !weatherSettings?.configured}
                      onClick={() => testWeatherMutation.mutate()}
                    >
                      {testWeatherMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      Test
                    </Button>
                  </div>
                  {weatherTestResult && (
                    <p className="rounded-lg border bg-green-50 p-3 text-sm text-green-900">{weatherTestResult}</p>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stripe">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-indigo-600" />
                    Stripe payments
                  </span>
                  <StatusBadge configured={!!stripeSettings?.configured} source={stripeSettings?.source} />
                </CardTitle>
                <CardDescription>
                  Web checkout for premium memberships. Create keys and price IDs in your{" "}
                  <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-green-700 underline">
                    Stripe Dashboard
                  </a>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveStripeMutation.mutate(stripeForm);
                  }}
                  className="space-y-4"
                >
                  <SecretInput
                    label="Secret key"
                    value={stripeForm.stripe_secret_key}
                    onChange={(v) => setStripeForm({ ...stripeForm, stripe_secret_key: v })}
                    configured={stripeSettings?.stripe_secret_key === "(configured)"}
                    placeholder="sk_live_... or sk_test_..."
                  />
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Publishable key</label>
                    <Input
                      value={stripeForm.stripe_publishable_key}
                      onChange={(e) =>
                        setStripeForm({ ...stripeForm, stripe_publishable_key: e.target.value })
                      }
                      placeholder="pk_live_... or pk_test_..."
                    />
                  </div>
                  <SecretInput
                    label="Webhook signing secret"
                    value={stripeForm.stripe_webhook_secret}
                    onChange={(v) => setStripeForm({ ...stripeForm, stripe_webhook_secret: v })}
                    configured={stripeSettings?.stripe_webhook_secret === "(configured)"}
                    placeholder="whsec_..."
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Monthly price ID</label>
                      <Input
                        value={stripeForm.stripe_monthly_price_id}
                        onChange={(e) =>
                          setStripeForm({ ...stripeForm, stripe_monthly_price_id: e.target.value })
                        }
                        placeholder="price_..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Yearly price ID</label>
                      <Input
                        value={stripeForm.stripe_yearly_price_id}
                        onChange={(e) =>
                          setStripeForm({ ...stripeForm, stripe_yearly_price_id: e.target.value })
                        }
                        placeholder="price_..."
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Price IDs can also be set per plan in Admin → Care Plans. These defaults are used when a plan has no Stripe price ID.
                  </p>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={saveStripeMutation.isPending}>
                      {saveStripeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={testStripeMutation.isPending || !stripeSettings?.configured}
                      onClick={() => testStripeMutation.mutate()}
                    >
                      {testStripeMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      Test connection
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="more">
            <div className="grid gap-4 sm:grid-cols-2">
              {hubLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href + item.title} href={item.href}>
                    <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Icon className="h-5 w-5 text-green-600" />
                          {item.title}
                        </CardTitle>
                        <CardDescription>{item.description}</CardDescription>
                        {item.note && <p className="text-xs text-muted-foreground">{item.note}</p>}
                      </CardHeader>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <p className="font-semibold">Priority order</p>
          <p className="mt-1">
            Values saved here are stored in the database and take precedence over <code>.env</code> variables.
            Environment variables remain supported as a fallback for deployment platforms.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}

export function AdminIntegrations() {
  return (
    <AdminGuard>
      <AdminIntegrationsContent />
    </AdminGuard>
  );
}
