import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Home, Plus, Pencil, Trash2, Loader2, Image, Video, Package } from "lucide-react";
import { FileUpload } from "@/components/FileUpload";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface HomeContentItem {
  id: number;
  section: string;
  type: string;
  name: string;
  description: string;
  mediaUrl: string;
  thumbnailUrl: string | null;
  productLink: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

const SECTIONS = [
  { key: "expert_corner", label: "Expert Corner" },
  { key: "tips_tricks", label: "Tips & Tricks" },
  { key: "equipments", label: "Equipments" },
  { key: "fertilizer_herbicide", label: "Fertilizer & Herbicide" },
  { key: "soil_water", label: "Soil & Water" },
  { key: "insects_disease", label: "Insects & Disease" },
];

const TYPES_BY_SECTION: Record<string, string[]> = {
  expert_corner: ["article", "video", "product"],
  tips_tricks: ["maintenance", "advance", "future"],
  equipments: ["article", "video", "product"],
  fertilizer_herbicide: ["article", "video", "product"],
  soil_water: ["article", "video", "product"],
  insects_disease: ["article", "video", "product"],
};

export function AdminHomeContent() {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("expert_corner");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HomeContentItem | null>(null);
  const [formData, setFormData] = useState({
    section: "expert_corner",
    type: "article",
    name: "",
    description: "",
    mediaUrl: "",
    thumbnailUrl: "",
    productLink: "",
    displayOrder: 0,
  });

  const { data: items = [], isLoading } = useQuery<HomeContentItem[]>({
    queryKey: ["/api/admin/home-content", activeSection],
    queryFn: async () => {
      const res = await fetch(`/api/admin/home-content?section=${activeSection}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      return json.data || json;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      apiRequest("/api/admin/home-content", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({ title: "Content created" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/home-content"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast({ title: "Failed to create", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number } & typeof formData) =>
      apiRequest(`/api/admin/home-content/${data.id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({ title: "Content updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/home-content"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/admin/home-content/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Content deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/home-content"] });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const resetForm = () => {
    setFormData({
      section: activeSection,
      type: TYPES_BY_SECTION[activeSection]?.[0] || "article",
      name: "",
      description: "",
      mediaUrl: "",
      thumbnailUrl: "",
      productLink: "",
      displayOrder: 0,
    });
    setEditingItem(null);
  };

  const handleAdd = () => {
    resetForm();
    setFormData(prev => ({ ...prev, section: activeSection }));
    setIsDialogOpen(true);
  };

  const handleEdit = (item: HomeContentItem) => {
    setEditingItem(item);
    setFormData({
      section: item.section,
      type: item.type,
      name: item.name,
      description: item.description || "",
      mediaUrl: item.mediaUrl || "",
      thumbnailUrl: item.thumbnailUrl || "",
      productLink: item.productLink || "",
      displayOrder: item.displayOrder,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getTypeIcon = (type: string) => {
    if (type === "video") return <Video className="h-4 w-4" />;
    if (type === "product") return <Package className="h-4 w-4" />;
    return <Image className="h-4 w-4" />;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Home className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Home Screen Content</h1>
              <p className="text-muted-foreground">Manage content sections for the mobile app home screen</p>
            </div>
          </div>
          <Button onClick={handleAdd} data-testid="button-add-content">
            <Plus className="h-4 w-4 mr-2" />
            Add Content
          </Button>
        </div>

        <Tabs value={activeSection} onValueChange={setActiveSection}>
          <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full">
            {SECTIONS.map((s) => (
              <TabsTrigger key={s.key} value={s.key} className="text-xs">
                {s.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {SECTIONS.map((section) => (
            <TabsContent key={section.key} value={section.key} className="mt-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : items.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No content in this section. Click "Add Content" to create one.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {items.map((item) => (
                    <Card key={item.id} data-testid={`card-content-${item.id}`}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          {item.mediaUrl && (
                            <img
                              src={item.mediaUrl}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(item.type)}
                              <span className="font-medium">{item.name}</span>
                              <span className="text-xs text-muted-foreground capitalize">({item.type})</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(item)}
                            data-testid={`button-edit-${item.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteMutation.mutate(item.id)}
                            data-testid={`button-delete-${item.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Content" : "Add Content"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Section</Label>
                  <Select
                    value={formData.section}
                    onValueChange={(v) => setFormData({ ...formData, section: v, type: TYPES_BY_SECTION[v]?.[0] || "article" })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTIONS.map((s) => (
                        <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v) => setFormData({ ...formData, type: v })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {(TYPES_BY_SECTION[formData.section] || ["article"]).map((t) => (
                        <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter content name"
                  data-testid="input-name"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter content description"
                  rows={3}
                  data-testid="input-description"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Media (Image/Video)</Label>
                <FileUpload
                  value={formData.mediaUrl}
                  onChange={(url) => setFormData({ ...formData, mediaUrl: url })}
                  accept="image/*,video/*"
                  uploadType="content"
                  placeholder="Upload media or paste URL"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Thumbnail (for videos)</Label>
                <FileUpload
                  value={formData.thumbnailUrl}
                  onChange={(url) => setFormData({ ...formData, thumbnailUrl: url })}
                  accept="image/*"
                  uploadType="image"
                  placeholder="Upload thumbnail or paste URL"
                />
              </div>
              {formData.type === "product" && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Affiliate Link</Label>
                  <Input
                    value={formData.productLink}
                    onChange={(e) => setFormData({ ...formData, productLink: e.target.value })}
                    placeholder="Enter affiliate/product URL"
                    data-testid="input-product-link"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Display Order</Label>
                <Input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  data-testid="input-display-order"
                />
              </div>
              <Button
                className="w-full mt-4"
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-submit"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingItem ? "Update Content" : "Create Content"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
