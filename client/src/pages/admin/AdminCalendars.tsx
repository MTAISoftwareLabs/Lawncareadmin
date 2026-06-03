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
import { Calendar, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { FileUpload } from "@/components/FileUpload";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface LawnCalendar {
  id: number;
  title: string;
  imageUrl: string;
  routeName: string;
  beginnerPdfUrl: string;
  intermediatePdfUrl: string;
  advancedPdfUrl: string;
  displayOrder: number;
  isActive: boolean;
}

export function AdminCalendars() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LawnCalendar | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    imageUrl: "",
    routeName: "",
    beginnerPdfUrl: "",
    intermediatePdfUrl: "",
    advancedPdfUrl: "",
    displayOrder: 0,
  });

  const { data: calendars = [], isLoading } = useQuery<LawnCalendar[]>({
    queryKey: ["/api/admin/calendars"],
    queryFn: async () => {
      const res = await fetch("/api/admin/calendars", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      return json.data || json;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      apiRequest("/api/admin/calendars", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({ title: "Calendar created" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/calendars"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast({ title: "Failed to create", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number } & typeof formData) =>
      apiRequest(`/api/admin/calendars/${data.id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({ title: "Calendar updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/calendars"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/admin/calendars/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Calendar deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/calendars"] });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const resetForm = () => {
    setFormData({
      title: "",
      imageUrl: "",
      routeName: "",
      beginnerPdfUrl: "",
      intermediatePdfUrl: "",
      advancedPdfUrl: "",
      displayOrder: 0,
    });
    setEditingItem(null);
  };

  const handleEdit = (item: LawnCalendar) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      imageUrl: item.imageUrl || "",
      routeName: item.routeName || "",
      beginnerPdfUrl: item.beginnerPdfUrl || "",
      intermediatePdfUrl: item.intermediatePdfUrl || "",
      advancedPdfUrl: item.advancedPdfUrl || "",
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
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Lawn Calendars</h1>
              <p className="text-muted-foreground">Manage grass type calendars with PDF plans</p>
            </div>
          </div>
          <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} data-testid="button-add-calendar">
            <Plus className="h-4 w-4 mr-2" />
            Add Calendar
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : calendars.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No calendars yet. Click "Add Calendar" to create one.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {calendars.map((cal) => (
              <Card key={cal.id} data-testid={`card-calendar-${cal.id}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <span>{cal.title}</span>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(cal)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(cal.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {cal.imageUrl && (
                    <img src={cal.imageUrl} alt={cal.title} className="w-full h-32 object-cover rounded mb-3" />
                  )}
                  <p className="text-sm text-muted-foreground">Route: {cal.routeName}</p>
                  <div className="mt-2 space-y-1 text-xs">
                    <p>Beginner PDF: {cal.beginnerPdfUrl ? "Set" : "Not set"}</p>
                    <p>Intermediate PDF: {cal.intermediatePdfUrl ? "Set" : "Not set"}</p>
                    <p>Advanced PDF: {cal.advancedPdfUrl ? "Set" : "Not set"}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Calendar" : "Add Calendar"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Title (Grass Type)</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Kentucky Bluegrass"
                  data-testid="input-title"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Route Name</Label>
                <Input
                  value={formData.routeName}
                  onChange={(e) => setFormData({ ...formData, routeName: e.target.value })}
                  placeholder="KentuckyBluegrass"
                  data-testid="input-route-name"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Cover Image</Label>
                <FileUpload
                  value={formData.imageUrl}
                  onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                  accept="image/*"
                  uploadType="image"
                  placeholder="Upload image or paste URL"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Beginner PDF</Label>
                <FileUpload
                  value={formData.beginnerPdfUrl}
                  onChange={(url) => setFormData({ ...formData, beginnerPdfUrl: url })}
                  accept=".pdf,application/pdf"
                  uploadType="pdf"
                  placeholder="Upload PDF or paste URL"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Intermediate PDF</Label>
                <FileUpload
                  value={formData.intermediatePdfUrl}
                  onChange={(url) => setFormData({ ...formData, intermediatePdfUrl: url })}
                  accept=".pdf,application/pdf"
                  uploadType="pdf"
                  placeholder="Upload PDF or paste URL"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Advanced PDF</Label>
                <FileUpload
                  value={formData.advancedPdfUrl}
                  onChange={(url) => setFormData({ ...formData, advancedPdfUrl: url })}
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
                {editingItem ? "Update Calendar" : "Create Calendar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
