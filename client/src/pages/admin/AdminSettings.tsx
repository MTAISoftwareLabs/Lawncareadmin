import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminLayout } from "@/components/AdminLayout";
import { Save, Lock, Upload, X, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";

function AdminSettingsContent() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    appName: "",
    logoUrl: "",
    heroTitle: "",
    heroSubtitle: "",
    heroButtonText: "",
    primaryColor: "",
    heroImage1: "",
    heroImage2: "",
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["landing-page-settings"],
    queryFn: api.admin.settings.getLandingPage,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        appName: settings.appName || "",
        logoUrl: settings.logoUrl || "",
        heroTitle: settings.heroTitle || "",
        heroSubtitle: settings.heroSubtitle || "",
        heroButtonText: settings.heroButtonText || "",
        primaryColor: settings.primaryColor || "",
        heroImage1: settings.heroImage1 || "",
        heroImage2: settings.heroImage2 || "",
      });
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: api.admin.settings.updateLandingPage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landing-page-settings"] });
      alert("Landing page settings updated successfully! Refresh the homepage to see changes.");
    },
  });
  
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      return apiRequest("/api/admin/change-password", { method: "PUT", body: JSON.stringify(data) });
    },
    onSuccess: () => {
      alert("Password changed successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (error: any) => {
      alert(error.message || "Failed to change password. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };
  
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert("All password fields are required");
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      alert("New password must be at least 6 characters long");
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New password and confirm password do not match");
      return;
    }
    
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'heroImage1' | 'heroImage2') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      setUploading(true);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setFormData(prev => ({ ...prev, [field]: data.url }));
    } catch (error) {
      alert("Failed to upload image");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Landing Page Settings</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">App Branding</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">App Name</label>
                <input
                  type="text"
                  value={formData.appName}
                  onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                  placeholder="Lawncare Workshop"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This name appears in the header and throughout the site
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Logo (Optional)</label>
                <div className="space-y-4">
                  {formData.logoUrl && (
                    <div className="relative inline-block">
                      <img src={formData.logoUrl} alt="Logo preview" className="h-16 object-contain border rounded-lg p-2" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, logoUrl: "" })}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-600 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        {uploading ? "Uploading..." : "Click to upload logo"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG or SVG (MAX. 5MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'logoUrl')}
                      disabled={uploading}
                      data-testid="input-logo-upload"
                    />
                  </label>
                  <p className="text-xs text-gray-500">
                    If provided, the logo image will be displayed instead of the app name
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Hero Section</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Hero Title</label>
                <input
                  type="text"
                  value={formData.heroTitle}
                  onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                  placeholder="Professional Lawn Care Guidance"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Hero Subtitle</label>
                <input
                  type="text"
                  value={formData.heroSubtitle}
                  onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                  placeholder="Expert tips and products for a healthier, greener lawn"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Button Text</label>
                <input
                  type="text"
                  value={formData.heroButtonText}
                  onChange={(e) => setFormData({ ...formData, heroButtonText: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                  placeholder="Shop Now"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Colors & Branding</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">Primary Color</label>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                  placeholder="hsl(142 76% 36%)"
                />
                <div
                  className="w-16 h-10 rounded-lg border-2 border-gray-300"
                  style={{ backgroundColor: formData.primaryColor }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Use HSL format: hsl(hue saturation% lightness%)
              </p>
              <div className="mt-2 flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, primaryColor: "hsl(142 76% 36%)" })}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                >
                  Green
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, primaryColor: "hsl(262 76% 50%)" })}
                  className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                >
                  Purple
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, primaryColor: "hsl(217 76% 50%)" })}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                >
                  Blue
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, primaryColor: "hsl(27 96% 61%)" })}
                  className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200"
                >
                  Orange
                </button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Hero Images (Optional)</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Hero Image 1</label>
                <div className="space-y-4">
                  {formData.heroImage1 && (
                    <div className="relative inline-block">
                      <img src={formData.heroImage1} alt="Hero 1 preview" className="h-32 object-cover rounded-lg border" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, heroImage1: "" })}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-600 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        {uploading ? "Uploading..." : "Click to upload hero image 1"}
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'heroImage1')}
                      disabled={uploading}
                      data-testid="input-hero-image-1"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Hero Image 2</label>
                <div className="space-y-4">
                  {formData.heroImage2 && (
                    <div className="relative inline-block">
                      <img src={formData.heroImage2} alt="Hero 2 preview" className="h-32 object-cover rounded-lg border" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, heroImage2: "" })}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-600 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        {uploading ? "Uploading..." : "Click to upload hero image 2"}
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'heroImage2')}
                      disabled={uploading}
                      data-testid="input-hero-image-2"
                    />
                  </label>
                </div>
              </div>
            </div>
          </Card>

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-lg"
            disabled={updateMutation.isPending}
          >
            <Save className="mr-2 h-5 w-5" />
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>

        <form onSubmit={handlePasswordChange} className="space-y-6 mt-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-bold">Change Password</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                    placeholder="Enter your current password"
                    data-testid="input-current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    data-testid="button-toggle-current-password"
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                    placeholder="Enter new password (min 6 characters)"
                    data-testid="input-new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    data-testid="button-toggle-new-password"
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 6 characters long
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                    placeholder="Confirm your new password"
                    data-testid="input-confirm-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    data-testid="button-toggle-confirm-password"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg"
                disabled={changePasswordMutation.isPending}
                data-testid="button-change-password"
              >
                <Lock className="mr-2 h-5 w-5" />
                {changePasswordMutation.isPending ? "Changing Password..." : "Change Password"}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
    </AdminLayout>
  );
}

export function AdminSettings() {
  return (
    <AdminGuard>
      <AdminSettingsContent />
    </AdminGuard>
  );
}
