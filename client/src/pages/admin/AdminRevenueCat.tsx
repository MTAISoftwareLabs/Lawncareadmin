import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Eye, EyeOff, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Settings = {
  id?: number;
  enabled: boolean;
  iosApiKey: string;
  androidApiKey: string;
  webApiKey: string;
  webhookAuthToken: string;
  secretApiKey: string;
  projectId: string;
  entitlementId: string;
  monthlyProductId: string;
  yearlyProductId: string;
};

const EMPTY: Settings = {
  enabled: false,
  iosApiKey: "",
  androidApiKey: "",
  webApiKey: "",
  webhookAuthToken: "",
  secretApiKey: "",
  projectId: "",
  entitlementId: "premium",
  monthlyProductId: "",
  yearlyProductId: "",
};

export function AdminRevenueCat() {
  const { toast } = useToast();
  const [form, setForm] = useState<Settings>(EMPTY);
  const [show, setShow] = useState({ webhook: false, secret: false });
  const [copied, setCopied] = useState(false);

  const { data: current, isLoading } = useQuery<Settings>({
    queryKey: ["/api/admin/revenuecat/settings"],
  });

  useEffect(() => {
    if (current) setForm({ ...EMPTY, ...current });
  }, [current]);

  const saveMutation = useMutation({
    mutationFn: (data: Settings) =>
      apiRequest("/api/admin/revenuecat/settings", { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({ title: "RevenueCat settings saved" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/revenuecat/settings"] });
    },
    onError: (e: any) => {
      toast({ title: "Save failed", description: String(e?.message || e), variant: "destructive" });
    },
  });

  const testMutation = useMutation({
    mutationFn: () => apiRequest("/api/admin/revenuecat/test", { method: "POST" }),
    onSuccess: (res: any) => {
      if (res?.ok) {
        toast({ title: "Connection OK", description: `Project: ${res.projectName}` });
      } else {
        toast({ title: "Connection failed", description: res?.error || `HTTP ${res?.status}`, variant: "destructive" });
      }
    },
    onError: (e: any) => {
      toast({ title: "Test failed", description: String(e?.message || e), variant: "destructive" });
    },
  });

  const webhookUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/webhooks/revenuecat`
      : "/api/webhooks/revenuecat";

  const copyWebhookUrl = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6 text-gray-500">Loading RevenueCat settings…</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-revenuecat-title">
            <CreditCard className="h-8 w-8" />
            RevenueCat Configuration
          </h1>
          <p className="text-gray-600">Configure RevenueCat subscriptions for iOS, Android, and Web. Mobile apps fetch these values at runtime from <code>/api/revenuecat/config</code>.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>Master switch — when disabled, the public config endpoint reports <code>enabled: false</code> so clients fall back to free.</CardDescription>
          </CardHeader>
          <CardContent>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                className="w-4 h-4"
                data-testid="checkbox-rc-enabled"
              />
              <span>Enable RevenueCat integration</span>
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project</CardTitle>
            <CardDescription>From RevenueCat dashboard → Project Settings → General.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Project ID</Label>
              <Input
                value={form.projectId}
                onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                placeholder="proj_xxxxxxxxxxxxxxxx"
                data-testid="input-rc-project-id"
              />
            </div>
            <div>
              <Label>Entitlement ID</Label>
              <Input
                value={form.entitlementId}
                onChange={(e) => setForm({ ...form, entitlementId: e.target.value })}
                placeholder="premium"
                data-testid="input-rc-entitlement"
              />
              <p className="text-xs text-gray-500 mt-1">The entitlement identifier in RevenueCat that grants premium access (default: "premium").</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Public API Keys</CardTitle>
            <CardDescription>Platform-specific public SDK keys. Safe to ship to clients — used by the mobile/web apps to initialize the RevenueCat SDK.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>iOS Public API Key</Label>
              <Input
                value={form.iosApiKey}
                onChange={(e) => setForm({ ...form, iosApiKey: e.target.value })}
                placeholder="appl_xxxxxxxxxxxxxxxx"
                data-testid="input-rc-ios-key"
              />
            </div>
            <div>
              <Label>Android Public API Key</Label>
              <Input
                value={form.androidApiKey}
                onChange={(e) => setForm({ ...form, androidApiKey: e.target.value })}
                placeholder="goog_xxxxxxxxxxxxxxxx"
                data-testid="input-rc-android-key"
              />
            </div>
            <div>
              <Label>Web Public API Key</Label>
              <Input
                value={form.webApiKey}
                onChange={(e) => setForm({ ...form, webApiKey: e.target.value })}
                placeholder="strp_xxxxxxxxxxxxxxxx (Stripe via RevenueCat) or rcb_xxx"
                data-testid="input-rc-web-key"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Identifiers</CardTitle>
            <CardDescription>The product IDs configured in App Store Connect and Google Play that map to your monthly and yearly subscriptions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Monthly Product ID</Label>
              <Input
                value={form.monthlyProductId}
                onChange={(e) => setForm({ ...form, monthlyProductId: e.target.value })}
                placeholder="lawncare_monthly"
                data-testid="input-rc-monthly"
              />
            </div>
            <div>
              <Label>Yearly Product ID</Label>
              <Input
                value={form.yearlyProductId}
                onChange={(e) => setForm({ ...form, yearlyProductId: e.target.value })}
                placeholder="lawncare_yearly"
                data-testid="input-rc-yearly"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Webhook</CardTitle>
            <CardDescription>Configure this URL and auth header in RevenueCat → Project Settings → Integrations → Webhooks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Webhook URL (read-only)</Label>
              <div className="flex gap-2">
                <Input value={webhookUrl} readOnly data-testid="input-rc-webhook-url" />
                <Button type="button" variant="outline" onClick={copyWebhookUrl} data-testid="button-copy-webhook-url">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label>Webhook Authorization Token</Label>
              <div className="relative">
                <Input
                  type={show.webhook ? "text" : "password"}
                  value={form.webhookAuthToken}
                  onChange={(e) => setForm({ ...form, webhookAuthToken: e.target.value })}
                  placeholder="A random secret you also paste into RevenueCat → Webhook → Authorization header"
                  className="pr-10"
                  data-testid="input-rc-webhook-token"
                />
                <button
                  type="button"
                  onClick={() => setShow({ ...show, webhook: !show.webhook })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  data-testid="button-toggle-webhook"
                >
                  {show.webhook ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                In RevenueCat, set the <code>Authorization</code> header to <code>Bearer &lt;this token&gt;</code>. If empty, the webhook accepts unauthenticated requests (not recommended).
                Note: the env var <code>REVENUECAT_WEBHOOK_AUTH</code> takes precedence over this setting if set.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Secret API Key (Server-side)</CardTitle>
            <CardDescription>RevenueCat v2 REST API key — used by the server for direct lookups. Never sent to clients.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Secret API Key</Label>
              <div className="relative">
                <Input
                  type={show.secret ? "text" : "password"}
                  value={form.secretApiKey}
                  onChange={(e) => setForm({ ...form, secretApiKey: e.target.value })}
                  placeholder="sk_xxxxxxxxxxxxxxxx"
                  className="pr-10"
                  data-testid="input-rc-secret-key"
                />
                <button
                  type="button"
                  onClick={() => setShow({ ...show, secret: !show.secret })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  data-testid="button-toggle-secret"
                >
                  {show.secret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => testMutation.mutate()}
              disabled={testMutation.isPending}
              data-testid="button-test-connection"
            >
              {testMutation.isPending ? "Testing…" : "Test Connection"}
            </Button>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button
            onClick={() => saveMutation.mutate(form)}
            disabled={saveMutation.isPending}
            data-testid="button-save-rc"
          >
            {saveMutation.isPending ? "Saving…" : "Save Settings"}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
