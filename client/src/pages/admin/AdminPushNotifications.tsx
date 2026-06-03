import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Bell, Send, Loader2, Users, Crown, User, Settings, CheckCircle, AlertCircle, FileJson, Globe, Smartphone } from "lucide-react";
import { FileUpload } from "@/components/FileUpload";
import { clearFirebaseConfigCache } from "@/lib/firebase";

export function AdminPushNotifications() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"send" | "config">("send");
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    imageUrl: "",
    actionUrl: "",
    actionType: "link",
    targetType: "all",
    targetUserIds: "",
  });
  const [firebaseConfig, setFirebaseConfig] = useState({
    firebase_service_account: "",
    firebase_web_api_key: "",
    firebase_web_auth_domain: "",
    firebase_web_project_id: "",
    firebase_web_storage_bucket: "",
    firebase_web_messaging_sender_id: "",
    firebase_web_app_id: "",
    firebase_web_vapid_key: "",
  });

  const { data: notifications, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/push-notifications"],
  });

  const { data: configData } = useQuery<any>({
    queryKey: ["/api/admin/firebase-settings"],
  });

  useEffect(() => {
    if (configData) {
      setFirebaseConfig({
        firebase_service_account: configData.firebase_service_account || "",
        firebase_web_api_key: configData.firebase_web_api_key || "",
        firebase_web_auth_domain: configData.firebase_web_auth_domain || "",
        firebase_web_project_id: configData.firebase_web_project_id || "",
        firebase_web_storage_bucket: configData.firebase_web_storage_bucket || "",
        firebase_web_messaging_sender_id: configData.firebase_web_messaging_sender_id || "",
        firebase_web_app_id: configData.firebase_web_app_id || "",
        firebase_web_vapid_key: configData.firebase_web_vapid_key || "",
      });
    }
  }, [configData]);

  const saveConfigMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("/api/admin/firebase-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/firebase-settings"] });
      clearFirebaseConfigCache();
      if (data?.firebaseInitialized === false && data?.firebaseError) {
        toast({ title: "Saved, but Firebase failed to initialize", description: data.firebaseError, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Firebase configuration saved successfully" });
      }
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("/api/admin/push-notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/push-notifications"] });
      if (data.success === false) {
        toast({ title: "Failed", description: data.message || "Failed to send notification", variant: "destructive" });
      } else {
        toast({ title: "Success", description: data.message || "Notification sent successfully" });
        setFormData({ title: "", body: "", imageUrl: "", actionUrl: "", actionType: "link", targetType: "all", targetUserIds: "" });
      }
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const testNotificationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/admin/push/test", {
        method: "POST",
      });
      return response;
    },
    onSuccess: (data: any) => {
      toast({ title: "Test Sent", description: data.message || "Check if you received the notification!" });
    },
    onError: (error: Error) => {
      toast({ title: "Test Failed", description: error.message, variant: "destructive" });
    },
  });

  const testMobileNotificationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/admin/push/test-mobile", {
        method: "POST",
      });
      return response;
    },
    onSuccess: (data: any) => {
      toast({ title: "Mobile Test Sent", description: data.message || "Check your phone!" });
    },
    onError: (error: Error) => {
      toast({ title: "Mobile Test Failed", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.body) {
      toast({ title: "Error", description: "Title and body are required", variant: "destructive" });
      return;
    }
    sendMutation.mutate(formData);
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

  const handleServiceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = event.target?.result as string;
          JSON.parse(json);
          setFirebaseConfig({ ...firebaseConfig, firebase_service_account: json });
          toast({ title: "Success", description: "Service account file loaded successfully" });
        } catch {
          toast({ title: "Error", description: "Invalid JSON file", variant: "destructive" });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSaveConfig = () => {
    saveConfigMutation.mutate(firebaseConfig);
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Push Notifications</h1>
                <p className="text-muted-foreground">Send push notifications to app users</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "send" ? "default" : "outline"}
            onClick={() => setActiveTab("send")}
            className={activeTab === "send" ? "bg-gradient-to-r from-violet-600 to-purple-600" : ""}
            data-testid="tab-send"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Notification
          </Button>
          <Button
            variant={activeTab === "config" ? "default" : "outline"}
            onClick={() => setActiveTab("config")}
            className={activeTab === "config" ? "bg-gradient-to-r from-orange-500 to-amber-500" : ""}
            data-testid="tab-config"
          >
            <Settings className="w-4 h-4 mr-2" />
            Firebase Config
          </Button>
        </div>

        {activeTab === "config" && (
          <div className="space-y-6">
            {/* Server-Side Config (for sending push notifications) */}
            <Card className="border-2 border-orange-200 dark:border-orange-900/50 shadow-lg shadow-orange-100/50 dark:shadow-orange-900/20">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                  <Smartphone className="w-5 h-5" />
                  Server Configuration (Mobile Push)
                </CardTitle>
                <CardDescription>Service account for sending push notifications to mobile apps</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <p className="font-medium mb-1">Setup Instructions:</p>
                      <ol className="list-decimal ml-4 space-y-1">
                        <li>Go to Firebase Console and select your project</li>
                        <li>Navigate to Project Settings → Service Accounts</li>
                        <li>Click "Generate new private key" to download the JSON file</li>
                        <li>Upload the file below or paste the contents</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Service Account JSON File
                  </label>
                  <div className="border-2 border-dashed border-orange-300 dark:border-orange-700 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleServiceFileUpload}
                      className="hidden"
                      id="service-account-file"
                      data-testid="input-service-file"
                    />
                    <label htmlFor="service-account-file" className="cursor-pointer">
                      <div className="flex flex-col items-center gap-2">
                        {firebaseConfig.firebase_service_account && firebaseConfig.firebase_service_account !== "(configured)" ? (
                          <>
                            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <p className="font-medium text-green-600">New service account file loaded</p>
                            <p className="text-sm text-muted-foreground">Click to replace</p>
                          </>
                        ) : firebaseConfig.firebase_service_account === "(configured)" ? (
                          <>
                            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <p className="font-medium text-green-600">Service account configured</p>
                            <p className="text-sm text-muted-foreground">Click to replace</p>
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                              <FileJson className="w-6 h-6 text-orange-600" />
                            </div>
                            <p className="font-medium">Upload Service Account JSON</p>
                            <p className="text-sm text-muted-foreground">Click to browse or drag and drop</p>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Web Client Config (for browser notifications in admin panel) */}
            <Card className="border-2 border-blue-200 dark:border-blue-900/50 shadow-lg shadow-blue-100/50 dark:shadow-blue-900/20">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <Globe className="w-5 h-5" />
                  Web Configuration (Admin Browser Notifications)
                </CardTitle>
                <CardDescription>Firebase Web SDK config for admin panel push notifications</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-purple-800 dark:text-purple-200">
                      <p className="font-medium mb-1">Where to find these values:</p>
                      <ol className="list-decimal ml-4 space-y-1">
                        <li>Go to Firebase Console → Project Settings → General</li>
                        <li>Scroll to "Your apps" and select/create a Web App</li>
                        <li>Copy the config values shown</li>
                        <li>For VAPID key: Go to Cloud Messaging tab → Web Push certificates</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">API Key *</label>
                    <Input
                      value={firebaseConfig.firebase_web_api_key}
                      onChange={(e) => setFirebaseConfig({ ...firebaseConfig, firebase_web_api_key: e.target.value })}
                      placeholder="AIzaSy..."
                      className="border-blue-200 focus:border-blue-400 dark:border-blue-800"
                      data-testid="input-web-api-key"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Auth Domain</label>
                    <Input
                      value={firebaseConfig.firebase_web_auth_domain}
                      onChange={(e) => setFirebaseConfig({ ...firebaseConfig, firebase_web_auth_domain: e.target.value })}
                      placeholder="your-project.firebaseapp.com"
                      className="border-blue-200 focus:border-blue-400 dark:border-blue-800"
                      data-testid="input-web-auth-domain"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Project ID *</label>
                    <Input
                      value={firebaseConfig.firebase_web_project_id}
                      onChange={(e) => setFirebaseConfig({ ...firebaseConfig, firebase_web_project_id: e.target.value })}
                      placeholder="your-project-id"
                      className="border-blue-200 focus:border-blue-400 dark:border-blue-800"
                      data-testid="input-web-project-id"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Storage Bucket</label>
                    <Input
                      value={firebaseConfig.firebase_web_storage_bucket}
                      onChange={(e) => setFirebaseConfig({ ...firebaseConfig, firebase_web_storage_bucket: e.target.value })}
                      placeholder="your-project.appspot.com"
                      className="border-blue-200 focus:border-blue-400 dark:border-blue-800"
                      data-testid="input-web-storage-bucket"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Messaging Sender ID *</label>
                    <Input
                      value={firebaseConfig.firebase_web_messaging_sender_id}
                      onChange={(e) => setFirebaseConfig({ ...firebaseConfig, firebase_web_messaging_sender_id: e.target.value })}
                      placeholder="123456789012"
                      className="border-blue-200 focus:border-blue-400 dark:border-blue-800"
                      data-testid="input-web-sender-id"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">App ID *</label>
                    <Input
                      value={firebaseConfig.firebase_web_app_id}
                      onChange={(e) => setFirebaseConfig({ ...firebaseConfig, firebase_web_app_id: e.target.value })}
                      placeholder="1:123456789012:web:abc123..."
                      className="border-blue-200 focus:border-blue-400 dark:border-blue-800"
                      data-testid="input-web-app-id"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">VAPID Key (for Web Push) *</label>
                  <Input
                    value={firebaseConfig.firebase_web_vapid_key}
                    onChange={(e) => setFirebaseConfig({ ...firebaseConfig, firebase_web_vapid_key: e.target.value })}
                    placeholder="BF3ChBT14anwC5oz..."
                    className="border-blue-200 focus:border-blue-400 dark:border-blue-800"
                    data-testid="input-web-vapid-key"
                  />
                  <p className="text-xs text-muted-foreground">Found in Firebase Console → Project Settings → Cloud Messaging → Web Push certificates</p>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={handleSaveConfig}
              disabled={saveConfigMutation.isPending} 
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg h-12 text-base" 
              data-testid="button-save-config"
            >
              {saveConfigMutation.isPending ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Saving...</>
              ) : (
                <><CheckCircle className="w-5 h-5 mr-2" />Save All Configuration</>
              )}
            </Button>
          </div>
        )}

        {activeTab === "send" && (
        <>
        <Card className="mb-6 border-2 border-green-200 dark:border-green-900/50 shadow-lg shadow-green-100/50 dark:shadow-green-900/20">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <Bell className="w-5 h-5" />
              Test Notifications
            </CardTitle>
            <CardDescription>Send a test notification to verify your setup is working</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => testMobileNotificationMutation.mutate()}
                disabled={testMobileNotificationMutation.isPending}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                data-testid="button-test-mobile-notification"
              >
                {testMobileNotificationMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>
                ) : (
                  <><Smartphone className="w-4 h-4 mr-2" />Test Mobile App Notification</>
                )}
              </Button>
              <Button
                onClick={() => testNotificationMutation.mutate()}
                disabled={testNotificationMutation.isPending}
                variant="outline"
                data-testid="button-test-notification"
              >
                {testNotificationMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>
                ) : (
                  <><Globe className="w-4 h-4 mr-2" />Test Web Browser</>
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              <strong>Mobile App:</strong> Make sure you've opened the app on your phone first to register the device.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6 border-2 border-violet-200 dark:border-violet-900/50 shadow-lg shadow-violet-100/50 dark:shadow-violet-900/20">
          <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-violet-700 dark:text-violet-300">
              <Send className="w-5 h-5" />
              Send New Notification
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                  Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Notification title"
                  required
                  className="border-violet-200 focus:border-violet-400 dark:border-violet-800"
                  data-testid="input-notif-title"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  Body *
                </label>
                <Textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  placeholder="Notification message"
                  rows={3}
                  required
                  className="border-violet-200 focus:border-violet-400 dark:border-violet-800"
                  data-testid="input-notif-body"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                  Image (optional)
                </label>
                <FileUpload
                  value={formData.imageUrl}
                  onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                  accept="image/*"
                  uploadType="image"
                  placeholder="Upload notification image"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                  Action Type
                </label>
                <select
                  value={formData.actionType}
                  onChange={(e) => setFormData({ ...formData, actionType: e.target.value })}
                  className="w-full p-2 border rounded-md border-violet-200 focus:border-violet-400 dark:border-violet-800 dark:bg-background"
                  data-testid="select-action-type"
                >
                  <option value="link">External Link (Website/TikTok)</option>
                  <option value="screen">App Screen</option>
                  <option value="deal">Deal Page</option>
                  <option value="lesson">Video Lesson</option>
                  <option value="competition">Competition</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                  Action URL / Link (optional)
                </label>
                <Input
                  value={formData.actionUrl}
                  onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
                  placeholder={formData.actionType === 'link' ? 'https://tiktok.com/@yourusername or any URL' : formData.actionType === 'screen' ? 'e.g., home, deals, lessons' : 'Enter ID or leave empty'}
                  className="border-violet-200 focus:border-violet-400 dark:border-violet-800"
                  data-testid="input-action-url"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.actionType === 'link' && 'Enter any website URL, TikTok link, or other external URL'}
                  {formData.actionType === 'screen' && 'Enter the app screen name (e.g., home, deals, lessons, diagnosis)'}
                  {formData.actionType === 'deal' && 'Enter the deal ID to open when tapped'}
                  {formData.actionType === 'lesson' && 'Enter the lesson ID to open when tapped'}
                  {formData.actionType === 'competition' && 'Enter the competition ID to open when tapped'}
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Target Audience
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, targetType: "all" })}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                      formData.targetType === "all"
                        ? "border-blue-500 bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30 scale-[1.02]"
                        : "border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                    }`}
                    data-testid="button-target-all"
                  >
                    <Users className="w-6 h-6" />
                    <span className="font-medium text-sm">All Users</span>
                    {formData.targetType === "all" && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      </div>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, targetType: "premium" })}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                      formData.targetType === "premium"
                        ? "border-amber-500 bg-gradient-to-br from-amber-500 to-yellow-500 text-white shadow-lg shadow-amber-200 dark:shadow-amber-900/30 scale-[1.02]"
                        : "border-gray-200 dark:border-gray-700 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                    }`}
                    data-testid="button-target-premium"
                  >
                    <Crown className="w-6 h-6" />
                    <span className="font-medium text-sm">Premium Only</span>
                    {formData.targetType === "premium" && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      </div>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, targetType: "specific" })}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                      formData.targetType === "specific"
                        ? "border-emerald-500 bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 scale-[1.02]"
                        : "border-gray-200 dark:border-gray-700 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                    }`}
                    data-testid="button-target-specific"
                  >
                    <User className="w-6 h-6" />
                    <span className="font-medium text-sm">Specific Users</span>
                    {formData.targetType === "specific" && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {formData.targetType === "specific" && (
                <div className="space-y-2 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                  <label className="text-sm font-medium text-emerald-700 dark:text-emerald-300">User IDs (comma-separated)</label>
                  <Input
                    value={formData.targetUserIds}
                    onChange={(e) => setFormData({ ...formData, targetUserIds: e.target.value })}
                    placeholder="1, 2, 3"
                    className="border-emerald-300 focus:border-emerald-500 bg-white dark:bg-gray-900"
                    data-testid="input-notif-userids"
                  />
                </div>
              )}

              <Button 
                type="submit" 
                disabled={sendMutation.isPending} 
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-200 dark:shadow-violet-900/30 h-12 text-base" 
                data-testid="button-send-notif"
              >
                {sendMutation.isPending ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Sending...</>
                ) : (
                  <><Send className="w-5 h-5 mr-2" />Send Notification</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-200 dark:border-gray-800">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/50 dark:to-slate-900/50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-violet-500" />
              Notification History
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {notifications && notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notif, index) => (
                  <div 
                    key={notif.id} 
                    className="border rounded-xl p-4 hover:shadow-md transition-shadow bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800" 
                    data-testid={`notif-${notif.id}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          index % 3 === 0 ? 'bg-gradient-to-br from-violet-500 to-purple-500' :
                          index % 3 === 1 ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                          'bg-gradient-to-br from-emerald-500 to-teal-500'
                        }`}>
                          {notif.title.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold">{notif.title}</h4>
                          <p className="text-sm text-muted-foreground">{notif.body}</p>
                        </div>
                      </div>
                      <div className="text-right text-sm flex flex-col gap-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          {notif.successCount} sent
                        </span>
                        {notif.failureCount > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                            {notif.failureCount} failed
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-4 mt-3 text-xs">
                      <span className={`px-2 py-1 rounded-md ${
                        notif.targetType === 'all' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        notif.targetType === 'premium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      }`}>
                        {notif.targetType === 'all' ? 'All Users' : notif.targetType === 'premium' ? 'Premium' : 'Specific'}
                      </span>
                      <span className="text-muted-foreground">{new Date(notif.sentAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center">
                  <Bell className="w-8 h-8 text-violet-400" />
                </div>
                <p className="text-muted-foreground">No notifications sent yet</p>
                <p className="text-sm text-muted-foreground mt-1">Create your first notification above</p>
              </div>
            )}
          </CardContent>
        </Card>
        </>
        )}
      </div>
    </AdminLayout>
  );
}
