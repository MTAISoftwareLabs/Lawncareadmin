import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Image as ImageIcon, Trash2, Eye, EyeOff, Plus, Loader2, ExternalLink } from "lucide-react";
import { FileUpload } from "@/components/FileUpload";

export function AdminBanners() {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    imageUrl: "",
    redirectUrl: "",
    displayOrder: 0,
    isActive: true,
  });

  const { data: banners, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/banners"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
      toast({ title: "Success", description: "Banner created successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest(`/api/admin/banners/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
      toast({ title: "Success", description: "Banner updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/banners/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
      toast({ title: "Success", description: "Banner deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.imageUrl) {
      toast({ title: "Error", description: "Title and Image URL are required", variant: "destructive" });
      return;
    }
    createMutation.mutate(formData);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      imageUrl: "",
      redirectUrl: "",
      displayOrder: 0,
      isActive: true,
    });
    setIsCreating(false);
  };

  const toggleActive = (banner: any) => {
    updateMutation.mutate({
      id: banner.id,
      data: { isActive: !banner.isActive },
    });
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
      <div className="max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Hero Banners</h1>
              <p className="text-muted-foreground">These images rotate in the homepage hero section &amp; mobile home screen</p>
            </div>
          </div>
          <Button onClick={() => setIsCreating(!isCreating)} data-testid="button-add-banner">
            <Plus className="w-4 h-4 mr-2" />
            {isCreating ? "Cancel" : "Add Banner"}
          </Button>
        </div>

        {isCreating && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Banner</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title *</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Banner title"
                      required
                      data-testid="input-banner-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Display Order</label>
                    <Input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      data-testid="input-banner-order"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Banner Image *</label>
                  <FileUpload
                    value={formData.imageUrl}
                    onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                    accept="image/*"
                    uploadType="image"
                    placeholder="Upload banner image"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Redirect URL (optional)</label>
                  <Input
                    value={formData.redirectUrl}
                    onChange={(e) => setFormData({ ...formData, redirectUrl: e.target.value })}
                    placeholder="https://example.com/page"
                    data-testid="input-banner-redirect"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={resetForm} data-testid="button-cancel">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-banner">
                    {createMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</>
                    ) : (
                      <>Create Banner</>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {banners && banners.length > 0 ? (
            banners.map((banner) => (
              <Card key={banner.id} data-testid={`card-banner-${banner.id}`}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-48 h-28 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                        data-testid={`img-banner-${banner.id}`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-lg" data-testid={`text-title-${banner.id}`}>
                            {banner.title}
                          </h3>
                          <div className="flex flex-wrap gap-2 mt-2 text-sm">
                            <span className="text-muted-foreground">Order: {banner.displayOrder}</span>
                            {banner.redirectUrl && (
                              <a href={banner.redirectUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 flex items-center gap-1">
                                <ExternalLink className="w-3 h-3" /> Link
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant={banner.isActive ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleActive(banner)}
                            disabled={updateMutation.isPending}
                            data-testid={`button-toggle-${banner.id}`}
                          >
                            {banner.isActive ? <><Eye className="w-4 h-4 mr-1" /> Active</> : <><EyeOff className="w-4 h-4 mr-1" /> Inactive</>}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteMutation.mutate(banner.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-${banner.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p data-testid="text-no-banners">No banners created yet. Click "Add Banner" to create one.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
