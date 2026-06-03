import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2, GripVertical, Eye, EyeOff } from "lucide-react";

interface PrivacyContentItem {
  id: number;
  heading: string;
  text: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function AdminPrivacyContent() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PrivacyContentItem | null>(null);
  const [formData, setFormData] = useState({
    heading: "",
    text: "",
    displayOrder: 0,
    isActive: true,
  });

  const { data: items = [], isLoading } = useQuery<PrivacyContentItem[]>({
    queryKey: ["/api/admin/privacy-content"],
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      apiRequest("/api/admin/privacy-content", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({ title: "Section created" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/privacy-content"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Failed to create", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number } & typeof formData) =>
      apiRequest(`/api/admin/privacy-content/${data.id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({ title: "Section updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/privacy-content"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/admin/privacy-content/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Section deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/privacy-content"] });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      heading: "",
      text: "",
      displayOrder: 0,
      isActive: true,
    });
    setEditingItem(null);
  };

  const openEdit = (item: PrivacyContentItem) => {
    setEditingItem(item);
    setFormData({
      heading: item.heading,
      text: item.text,
      displayOrder: item.displayOrder,
      isActive: item.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.heading.trim() || !formData.text.trim()) {
      toast({ title: "Heading and text are required", variant: "destructive" });
      return;
    }
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
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
      <div className="max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Privacy Content</h1>
            <p className="text-muted-foreground">Manage content sections for the privacy API</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-privacy-content">
                <Plus className="w-4 h-4 mr-2" />
                Add Section
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? "Edit Section" : "Add Section"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Heading</label>
                  <Input
                    placeholder="Section heading"
                    value={formData.heading}
                    onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                    data-testid="input-heading"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Content</label>
                  <Textarea
                    placeholder="Section content/text"
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    rows={6}
                    data-testid="input-text"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Display Order</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                      data-testid="input-display-order"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4"
                      data-testid="checkbox-active"
                    />
                    <label htmlFor="isActive" className="text-sm">Active</label>
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit"
                >
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingItem ? "Update" : "Create"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {items.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No privacy content sections yet. Add one to get started.
              </CardContent>
            </Card>
          ) : (
            items.map((item) => (
              <Card key={item.id} className={!item.isActive ? "opacity-60" : ""} data-testid={`card-section-${item.id}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <GripVertical className="w-5 h-5 text-muted-foreground mt-1 cursor-move" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{item.heading}</h3>
                          {!item.isActive && (
                            <span className="text-xs bg-muted px-2 py-0.5 rounded">Hidden</span>
                          )}
                          <span className="text-xs text-muted-foreground">Order: {item.displayOrder}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.text}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateMutation.mutate({ id: item.id, heading: item.heading, text: item.text, displayOrder: item.displayOrder, isActive: !item.isActive })}
                        data-testid={`button-toggle-${item.id}`}
                      >
                        {item.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEdit(item)}
                        data-testid={`button-edit-${item.id}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => deleteMutation.mutate(item.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-${item.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">API Endpoint</h3>
          <code className="text-sm bg-background px-2 py-1 rounded">GET /api/privacy-content</code>
          <p className="text-sm text-muted-foreground mt-2">
            Returns all active sections ordered by display order in format: {`{ data: [{ heading, text }] }`}
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
