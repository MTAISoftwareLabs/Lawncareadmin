import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Save } from "lucide-react";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminLayout } from "@/components/AdminLayout";

function AdminIntegrationsContent() {
  const queryClient = useQueryClient();
  const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);
  const [showGoogleKey, setShowGoogleKey] = useState(false);

  const [razorpayData, setRazorpayData] = useState({
    publicKey: "",
    secretKey: "",
    isActive: true,
  });

  const [googleMapsData, setGoogleMapsData] = useState({
    publicKey: "",
    secretKey: "",
    isActive: true,
  });

  const { data: integrations, isLoading } = useQuery({
    queryKey: ["admin", "integrations"],
    queryFn: api.admin.integrations.getAll,
  });

  useEffect(() => {
    if (integrations) {
      const razorpay = integrations.find((i: any) => i.provider === "razorpay");
      const googleMaps = integrations.find((i: any) => i.provider === "google_maps");

      if (razorpay) {
        setRazorpayData({
          publicKey: razorpay.publicKey || "",
          secretKey: razorpay.secretKey || "",
          isActive: razorpay.isActive,
        });
      }

      if (googleMaps) {
        setGoogleMapsData({
          publicKey: googleMaps.publicKey || "",
          secretKey: googleMaps.secretKey || "",
          isActive: googleMaps.isActive,
        });
      }
    }
  }, [integrations]);

  const saveIntegrationMutation = useMutation({
    mutationFn: (data: any) => api.admin.integrations.save(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "integrations"] });
      alert("Integration settings saved successfully!");
    },
  });

  const handleSaveRazorpay = () => {
    saveIntegrationMutation.mutate({
      provider: "razorpay",
      publicKey: razorpayData.publicKey,
      secretKey: razorpayData.secretKey,
      isActive: razorpayData.isActive,
    });
  };

  const handleSaveGoogleMaps = () => {
    saveIntegrationMutation.mutate({
      provider: "google_maps",
      publicKey: googleMapsData.publicKey,
      secretKey: googleMapsData.secretKey,
      isActive: googleMapsData.isActive,
    });
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <AdminLayout>
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">API Integrations</h2>
        <p className="text-gray-600 mt-2">Manage third-party API keys and integrations for your store.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="6" width="20" height="12" rx="2" fill="#3395FF"/>
              <path d="M2 10h20" stroke="white" strokeWidth="2"/>
              <circle cx="6" cy="14" r="1" fill="white"/>
            </svg>
            Razorpay Payment Gateway
          </CardTitle>
          <p className="text-sm text-gray-600">
            Configure Razorpay for accepting payments. Get your API keys from{" "}
            <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Razorpay Dashboard
            </a>
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Key ID (Public Key)</label>
            <Input
              placeholder="rzp_test_... or rzp_live_..."
              value={razorpayData.publicKey}
              onChange={(e) => setRazorpayData({ ...razorpayData, publicKey: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">This key is visible to customers during checkout.</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Key Secret (Secret Key)</label>
            <div className="relative">
              <Input
                type={showRazorpaySecret ? "text" : "password"}
                placeholder="Enter your Razorpay secret key"
                value={razorpayData.secretKey}
                onChange={(e) => setRazorpayData({ ...razorpayData, secretKey: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showRazorpaySecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Keep this secret secure. It's used for server-side verification only.</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="razorpay-active"
              checked={razorpayData.isActive}
              onChange={(e) => setRazorpayData({ ...razorpayData, isActive: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="razorpay-active" className="text-sm font-medium">
              Enable Razorpay payments
            </label>
          </div>

          <Button
            onClick={handleSaveRazorpay}
            disabled={!razorpayData.publicKey || !razorpayData.secretKey || saveIntegrationMutation.isPending}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveIntegrationMutation.isPending ? "Saving..." : "Save Razorpay Settings"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#4285F4"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#34A853" strokeWidth="2" fill="none"/>
            </svg>
            Google Maps API
          </CardTitle>
          <p className="text-sm text-gray-600">
            Enable address autocomplete with Google Maps. Get your API key from{" "}
            <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Google Cloud Console
            </a>
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">API Key</label>
            <div className="relative">
              <Input
                type={showGoogleKey ? "text" : "password"}
                placeholder="AIza..."
                value={googleMapsData.publicKey}
                onChange={(e) => setGoogleMapsData({ ...googleMapsData, publicKey: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowGoogleKey(!showGoogleKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showGoogleKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enable "Maps JavaScript API" and "Places API" in your Google Cloud project.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="google-maps-active"
              checked={googleMapsData.isActive}
              onChange={(e) => setGoogleMapsData({ ...googleMapsData, isActive: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="google-maps-active" className="text-sm font-medium">
              Enable Google Maps address autocomplete
            </label>
          </div>

          <Button
            onClick={handleSaveGoogleMaps}
            disabled={!googleMapsData.publicKey || saveIntegrationMutation.isPending}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveIntegrationMutation.isPending ? "Saving..." : "Save Google Maps Settings"}
          </Button>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Important Security Notes:</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Razorpay Key Secret is never exposed to customers and only used for server-side verification</li>
          <li>Google Maps API key should have domain restrictions enabled in Google Cloud Console</li>
          <li>Use test mode keys (rzp_test_...) for development and live keys for production</li>
          <li>Never share your secret keys publicly or commit them to version control</li>
        </ul>
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
