import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Send, Settings, FileText, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminNotifications() {
  const { toast } = useToast();
  const [testType, setTestType] = useState("email");
  const [testRecipient, setTestRecipient] = useState("");
  const [testMessage, setTestMessage] = useState("This is a test notification from Lawncare Workshop.");

  const [settings, setSettings] = useState({
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: false,
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
    smtpFrom: "",
    twilioAccountSid: "",
    twilioAuthToken: "",
    twilioPhoneNumber: "",
    firebaseServerKey: "",
  });
  
  const [showSecrets, setShowSecrets] = useState({
    smtpPassword: false,
    twilioAuthToken: false,
    firebaseServerKey: false,
  });

  const { data: logs } = useQuery<any[]>({
    queryKey: ["/api/admin/notifications/logs"],
  });

  const { data: currentSettings } = useQuery<any>({
    queryKey: ["/api/admin/notifications/settings"],
  });
  
  useEffect(() => {
    if (currentSettings) setSettings(currentSettings);
  }, [currentSettings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/admin/notifications/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications/settings"] });
      toast({ title: "Settings updated successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to update settings", variant: "destructive" });
    },
  });

  const testNotificationMutation = useMutation({
    mutationFn: async (data: { type: string; recipient: string; message: string }) => {
      const response = await fetch("/api/admin/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications/logs"] });
      toast({ title: "Test notification sent successfully! Check console logs." });
      setTestRecipient("");
      setTestMessage("This is a test notification from Lawncare Workshop.");
    },
    onError: () => {
      toast({ title: "Failed to send test notification", variant: "destructive" });
    },
  });

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(settings);
  };

  const handleTestNotification = () => {
    if (!testRecipient) {
      toast({ title: "Please enter a recipient", variant: "destructive" });
      return;
    }
    testNotificationMutation.mutate({
      type: testType,
      recipient: testRecipient,
      message: testMessage,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Notification Management
          </h1>
          <p className="text-gray-600">Configure and manage notifications</p>
        </div>

        <Tabs defaultValue="settings" className="w-full">
          <TabsList>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="test">
              <Send className="h-4 w-4 mr-2" />
              Test Notification
            </TabsTrigger>
            <TabsTrigger value="logs">
              <FileText className="h-4 w-4 mr-2" />
              Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Channels</CardTitle>
                <CardDescription>Enable/disable notification channels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="emailEnabled"
                    checked={settings.emailEnabled}
                    onChange={(e) => setSettings({ ...settings, emailEnabled: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                    data-testid="checkbox-email-enabled"
                  />
                  <Label htmlFor="emailEnabled" className="cursor-pointer">Email Notifications</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="smsEnabled"
                    checked={settings.smsEnabled}
                    onChange={(e) => setSettings({ ...settings, smsEnabled: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                    data-testid="checkbox-sms-enabled"
                  />
                  <Label htmlFor="smsEnabled" className="cursor-pointer">SMS Notifications</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="pushEnabled"
                    checked={settings.pushEnabled}
                    onChange={(e) => setSettings({ ...settings, pushEnabled: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                    data-testid="checkbox-push-enabled"
                  />
                  <Label htmlFor="pushEnabled" className="cursor-pointer">Push Notifications</Label>
                </div>
              </CardContent>
            </Card>

            {settings.emailEnabled && (
              <Card>
                <CardHeader>
                  <CardTitle>Email Configuration (SMTP)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>SMTP Host</Label>
                      <Input
                        value={settings.smtpHost}
                        onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                        placeholder="smtp.gmail.com"
                        data-testid="input-smtp-host"
                      />
                    </div>
                    <div>
                      <Label>SMTP Port</Label>
                      <Input
                        type="number"
                        value={settings.smtpPort}
                        onChange={(e) => setSettings({ ...settings, smtpPort: parseInt(e.target.value) })}
                        data-testid="input-smtp-port"
                      />
                    </div>
                    <div>
                      <Label>SMTP User</Label>
                      <Input
                        value={settings.smtpUser}
                        onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                        placeholder="your@email.com"
                        data-testid="input-smtp-user"
                      />
                    </div>
                    <div>
                      <Label>SMTP Password</Label>
                      <div className="relative">
                        <Input
                          type={showSecrets.smtpPassword ? "text" : "password"}
                          value={settings.smtpPassword}
                          onChange={(e) => setSettings({ ...settings, smtpPassword: e.target.value })}
                          data-testid="input-smtp-password"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecrets({ ...showSecrets, smtpPassword: !showSecrets.smtpPassword })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          data-testid="button-toggle-smtp-password"
                        >
                          {showSecrets.smtpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <Label>From Email</Label>
                      <Input
                        value={settings.smtpFrom}
                        onChange={(e) => setSettings({ ...settings, smtpFrom: e.target.value })}
                        placeholder="noreply@lawncareworkshop.com"
                        data-testid="input-smtp-from"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {settings.smsEnabled && (
              <Card>
                <CardHeader>
                  <CardTitle>SMS Configuration (Twilio)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Account SID</Label>
                    <Input
                      value={settings.twilioAccountSid}
                      onChange={(e) => setSettings({ ...settings, twilioAccountSid: e.target.value })}
                      data-testid="input-twilio-sid"
                    />
                  </div>
                  <div>
                    <Label>Auth Token</Label>
                    <div className="relative">
                      <Input
                        type={showSecrets.twilioAuthToken ? "text" : "password"}
                        value={settings.twilioAuthToken}
                        onChange={(e) => setSettings({ ...settings, twilioAuthToken: e.target.value })}
                        data-testid="input-twilio-token"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecrets({ ...showSecrets, twilioAuthToken: !showSecrets.twilioAuthToken })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        data-testid="button-toggle-twilio-token"
                      >
                        {showSecrets.twilioAuthToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input
                      value={settings.twilioPhoneNumber}
                      onChange={(e) => setSettings({ ...settings, twilioPhoneNumber: e.target.value })}
                      placeholder="+1234567890"
                      data-testid="input-twilio-phone"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {settings.pushEnabled && (
              <Card>
                <CardHeader>
                  <CardTitle>Push Notification Configuration (Firebase)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Label>Firebase Server Key</Label>
                  <Textarea
                    value={settings.firebaseServerKey}
                    onChange={(e) => setSettings({ ...settings, firebaseServerKey: e.target.value })}
                    rows={4}
                    data-testid="textarea-firebase-key"
                  />
                </CardContent>
              </Card>
            )}

            <Button 
              onClick={handleSaveSettings} 
              disabled={updateSettingsMutation.isPending}
              data-testid="button-save-settings"
            >
              Save Settings
            </Button>
          </TabsContent>

          <TabsContent value="test">
            <Card>
              <CardHeader>
                <CardTitle>Send Test Notification</CardTitle>
                <CardDescription>Test your notification configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Notification Type</Label>
                  <Select value={testType} onValueChange={setTestType}>
                    <SelectTrigger data-testid="select-test-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="push">Push</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Recipient ({testType === "email" ? "Email" : testType === "sms" ? "Phone" : "Device Token"})</Label>
                  <Input
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    placeholder={testType === "email" ? "test@example.com" : testType === "sms" ? "+911234567890" : "device_token"}
                    data-testid="input-test-recipient"
                  />
                </div>
                <div>
                  <Label>Message</Label>
                  <Textarea
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    rows={4}
                    data-testid="textarea-test-message"
                  />
                </div>
                <Button 
                  onClick={handleTestNotification}
                  disabled={testNotificationMutation.isPending}
                  data-testid="button-send-test"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Test Notification
                </Button>
                <p className="text-sm text-gray-600">
                  Note: Test notifications are logged in console. Configure actual SMTP/Twilio/Firebase credentials for real delivery.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Notification Logs</CardTitle>
                <CardDescription>Last 100 notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {logs?.length === 0 && (
                    <p className="text-center py-8 text-gray-500">No notifications sent yet</p>
                  )}
                  {logs?.map((log: any) => (
                    <div key={log.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{log.type}</span>
                            <span className="text-xs px-2 py-1 rounded bg-gray-100">{log.channel}</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              log.status === 'sent' ? 'bg-green-100 text-green-800' :
                              log.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {log.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">To: {log.recipient}</p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {log.subject && <p className="text-sm font-semibold">{log.subject}</p>}
                      <p className="text-sm text-gray-700">{log.message}</p>
                      {log.errorMessage && (
                        <p className="text-xs text-red-600">Error: {log.errorMessage}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
