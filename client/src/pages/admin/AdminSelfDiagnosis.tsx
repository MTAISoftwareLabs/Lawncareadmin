import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Stethoscope, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { FileUpload } from "@/components/FileUpload";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface SelfDiagnosisFlow {
  id: number;
  title: string;
  imageUrl: string;
  questions: string;
  displayOrder: number;
  isActive: boolean;
}

export function AdminSelfDiagnosis() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SelfDiagnosisFlow | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    imageUrl: "",
    questions: "[]",
    displayOrder: 0,
  });

  const { data: flows = [], isLoading } = useQuery<SelfDiagnosisFlow[]>({
    queryKey: ["/api/admin/self-diagnosis"],
    queryFn: async () => {
      const res = await fetch("/api/admin/self-diagnosis", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      return json.data || json;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      apiRequest("/api/admin/self-diagnosis", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({ title: "Diagnosis flow created" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/self-diagnosis"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast({ title: "Failed to create", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number } & typeof formData) =>
      apiRequest(`/api/admin/self-diagnosis/${data.id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({ title: "Diagnosis flow updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/self-diagnosis"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/admin/self-diagnosis/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Diagnosis flow deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/self-diagnosis"] });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const resetForm = () => {
    setFormData({
      title: "",
      imageUrl: "",
      questions: "[]",
      displayOrder: 0,
    });
    setEditingItem(null);
  };

  const handleEdit = (item: SelfDiagnosisFlow) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      imageUrl: item.imageUrl || "",
      questions: item.questions || "[]",
      displayOrder: item.displayOrder,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    try {
      JSON.parse(formData.questions);
    } catch {
      toast({ title: "Invalid JSON in questions", variant: "destructive" });
      return;
    }
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getQuestionCount = (questionsJson: string) => {
    try {
      return JSON.parse(questionsJson)?.length || 0;
    } catch {
      return 0;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">Self Diagnosis</h1>
              <p className="text-muted-foreground">Manage decision tree diagnosis flows</p>
            </div>
          </div>
          <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} data-testid="button-add-diagnosis">
            <Plus className="h-4 w-4 mr-2" />
            Add Diagnosis Flow
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : flows.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No diagnosis flows yet. Click "Add Diagnosis Flow" to create one.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {flows.map((flow) => (
              <Card key={flow.id} data-testid={`card-diagnosis-${flow.id}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="truncate">{flow.title}</span>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(flow)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(flow.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {flow.imageUrl && (
                    <img src={flow.imageUrl} alt={flow.title} className="w-full h-32 object-cover rounded mb-3" />
                  )}
                  <p className="text-sm text-muted-foreground">
                    {getQuestionCount(flow.questions)} questions in flow
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Diagnosis Flow" : "Add Diagnosis Flow"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Do You Have Brown Patches in Your Lawn?"
                  data-testid="input-title"
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
                <Label className="text-sm font-medium">Questions (JSON)</Label>
                <Textarea
                  value={formData.questions}
                  onChange={(e) => setFormData({ ...formData, questions: e.target.value })}
                  placeholder='[{"id":"Q1","question":"...","answers":[...]}]'
                  rows={10}
                  className="font-mono text-sm"
                  data-testid="input-questions"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter decision tree as JSON array with questions and answers
                </p>
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
                {editingItem ? "Update Diagnosis Flow" : "Create Diagnosis Flow"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
