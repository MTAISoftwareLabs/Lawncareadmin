import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Mail, Loader2, Send, CheckCircle2, XCircle } from "lucide-react";

interface EmailSettings {
  smtp_host: string;
  smtp_port: string;
  smtp_user: string;
  smtp_pass: string;
  smtp_from: string;
  configured: boolean;
}

export function AdminEmailSettings() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    smtp_host: "",
    smtp_port: "587",
    smtp_user: "",
    smtp_pass: "",
    smtp_from: "",
  });

  const { data, isLoading } = useQuery<EmailSettings>({
    queryKey: ["/api/admin/email-settings"],
  });

  useEffect(() => {
    if (data) {
      setForm({
        smtp_host: data.smtp_host || "",
        smtp_port: data.smtp_port || "587",
        smtp_user: data.smtp_user || "",
        smtp_pass: data.smtp_pass === "(configured)" ? "(configured)" : "",
        smtp_from: data.smtp_from || "",
      });
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async (payload: typeof form) =>
      apiRequest("/api/admin/email-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-settings"] });
      toast({ title: "Saved", description: "Email settings updated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    },
  });

  const testMutation = useMutation({
    mutationFn: async () =>
      apiRequest("/api/admin/email-settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }),
    onSuccess: (res: any) => {
      toast({ title: "Test email sent", description: res?.message || "Check your inbox." });
    },
    onError: (err: any) => {
      toast({
        title: "Test failed",
        description: err?.message || "Could not send test email.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(form);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Mail className="w-7 h-7" /> Email / SMTP Settings
          </h1>
          <p className="text-muted-foreground">
            Configure the email account used to send password reset codes and other emails.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {data?.configured ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-600" /> Email is configured
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-amber-600" /> Email is not configured yet
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">SMTP Host</label>
                <Input
                  value={form.smtp_host}
                  onChange={(e) => setForm({ ...form, smtp_host: e.target.value })}
                  placeholder="smtp.gmail.com"
                  data-testid="input-smtp-host"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Port</label>
                  <Input
                    value={form.smtp_port}
                    onChange={(e) => setForm({ ...form, smtp_port: e.target.value })}
                    placeholder="587"
                    data-testid="input-smtp-port"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">From Address</label>
                  <Input
                    value={form.smtp_from}
                    onChange={(e) => setForm({ ...form, smtp_from: e.target.value })}
                    placeholder="noreply@thelawncareworkshop.com"
                    data-testid="input-smtp-from"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">SMTP Username</label>
                <Input
                  value={form.smtp_user}
                  onChange={(e) => setForm({ ...form, smtp_user: e.target.value })}
                  placeholder="you@gmail.com"
                  data-testid="input-smtp-user"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  SMTP Password {data?.smtp_pass === "(configured)" && "(leave blank to keep current)"}
                </label>
                <Input
                  type="password"
                  value={form.smtp_pass === "(configured)" ? "" : form.smtp_pass}
                  onChange={(e) => setForm({ ...form, smtp_pass: e.target.value })}
                  placeholder={data?.smtp_pass === "(configured)" ? "••••••••" : "App password"}
                  data-testid="input-smtp-pass"
                />
                <p className="text-xs text-muted-foreground">
                  For Gmail, use a 16-character App Password (Google Account → Security → App passwords),
                  not your normal login password.
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={saveMutation.isPending} data-testid="button-save-email">
                  {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Settings
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={testMutation.isPending || !data?.configured}
                  onClick={() => testMutation.mutate()}
                  data-testid="button-test-email"
                >
                  {testMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Send Test Email
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
