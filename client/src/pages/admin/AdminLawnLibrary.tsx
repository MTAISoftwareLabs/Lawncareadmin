import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookOpen, Plus, Pencil, Trash2, Loader2, Download } from "lucide-react";
import { FileUpload } from "@/components/FileUpload";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface LawnLibraryEbook {
  id: number;
  name: string;
  imageUrl: string;
  downloadUrl: string;
  displayOrder: number;
  isActive: boolean;
}

export function AdminLawnLibrary() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LawnLibraryEbook | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    imageUrl: "",
    downloadUrl: "",
    displayOrder: 0,
  });

  const { data: ebooks = [], isLoading } = useQuery<LawnLibraryEbook[]>({
    queryKey: ["/api/admin/ebooks"],
    queryFn: async () => {
      const res = await fetch("/api/admin/ebooks", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      return json.data || json;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      apiRequest("/api/admin/ebooks", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({ title: "Ebook created" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ebooks"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast({ title: "Failed to create", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number } & typeof formData) =>
      apiRequest(`/api/admin/ebooks/${data.id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({ title: "Ebook updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ebooks"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/admin/ebooks/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Ebook deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ebooks"] });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const resetForm = () => {
    setFormData({
      name: "",
      imageUrl: "",
      downloadUrl: "",
      displayOrder: 0,
    });
    setEditingItem(null);
  };

  const handleEdit = (item: LawnLibraryEbook) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      imageUrl: item.imageUrl || "",
      downloadUrl: item.downloadUrl || "",
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 text-white">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-sky-600 bg-clip-text text-transparent">Lawn Library</h1>
              <p className="text-muted-foreground">Manage ebooks and PDF downloads</p>
            </div>
          </div>
          <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} data-testid="button-add-ebook">
            <Plus className="h-4 w-4 mr-2" />
            Add Ebook
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : ebooks.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No ebooks yet. Click "Add Ebook" to create one.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {ebooks.map((ebook) => (
              <Card key={ebook.id} data-testid={`card-ebook-${ebook.id}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span className="truncate">{ebook.name}</span>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(ebook)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(ebook.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ebook.imageUrl && (
                    <img src={ebook.imageUrl} alt={ebook.name} className="w-full h-40 object-cover rounded mb-3" />
                  )}
                  {ebook.downloadUrl && (
                    <a
                      href={ebook.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Download className="h-4 w-4" />
                      Download PDF
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Ebook" : "Add Ebook"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Cool Season Turfgrass ID"
                  data-testid="input-name"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Cover Image</Label>
                <FileUpload
                  value={formData.imageUrl}
                  onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                  accept="image/*"
                  uploadType="image"
                  placeholder="Upload cover image or paste URL"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Ebook PDF</Label>
                <FileUpload
                  value={formData.downloadUrl}
                  onChange={(url) => setFormData({ ...formData, downloadUrl: url })}
                  accept=".pdf,application/pdf"
                  uploadType="pdf"
                  placeholder="Upload PDF or paste URL"
                />
              </div>
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
                {editingItem ? "Update Ebook" : "Create Ebook"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
