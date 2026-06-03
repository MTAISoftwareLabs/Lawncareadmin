import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Leaf, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface GrassType {
  id: number;
  name: string;
  category: string;
  description: string;
  idealTemperature: string;
  waterNeeds: string;
  sunRequirements: string;
  maintenanceLevel: string;
  isActive: boolean;
}

export function AdminGrassTypes() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGrass, setEditingGrass] = useState<GrassType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "cool-season",
    description: "",
    idealTemperature: "",
    waterNeeds: "",
    sunRequirements: "",
    maintenanceLevel: "",
  });

  const { data: grassTypes = [], isLoading } = useQuery<GrassType[]>({
    queryKey: ["/api/admin/grass-types"],
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      apiRequest("/api/admin/grass-types", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({ title: "Grass type created" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/grass-types"] });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number } & typeof formData) =>
      apiRequest(`/api/admin/grass-types/${data.id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({ title: "Grass type updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/grass-types"] });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/admin/grass-types/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Grass type deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/grass-types"] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      category: "cool-season",
      description: "",
      idealTemperature: "",
      waterNeeds: "",
      sunRequirements: "",
      maintenanceLevel: "",
    });
    setEditingGrass(null);
  };

  const handleEdit = (grass: GrassType) => {
    setEditingGrass(grass);
    setFormData({
      name: grass.name,
      category: grass.category,
      description: grass.description || "",
      idealTemperature: grass.idealTemperature || "",
      waterNeeds: grass.waterNeeds || "",
      sunRequirements: grass.sunRequirements || "",
      maintenanceLevel: grass.maintenanceLevel || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingGrass) {
      updateMutation.mutate({ id: editingGrass.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Grass Types</h1>
            <p className="text-muted-foreground">Manage cool-season grass types</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-grass-type">
                <Plus className="w-4 h-4 mr-2" />
                Add Grass Type
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingGrass ? "Edit" : "Add"} Grass Type</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <select
                  className="w-full p-2 border rounded-md"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="cool-season">Cool Season</option>
                  <option value="warm-season">Warm Season</option>
                </select>
                <Textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <Input
                  placeholder="Ideal Temperature (e.g., 60-75°F)"
                  value={formData.idealTemperature}
                  onChange={(e) => setFormData({ ...formData, idealTemperature: e.target.value })}
                />
                <Input
                  placeholder="Water Needs"
                  value={formData.waterNeeds}
                  onChange={(e) => setFormData({ ...formData, waterNeeds: e.target.value })}
                />
                <Input
                  placeholder="Sun Requirements"
                  value={formData.sunRequirements}
                  onChange={(e) => setFormData({ ...formData, sunRequirements: e.target.value })}
                />
                <Input
                  placeholder="Maintenance Level"
                  value={formData.maintenanceLevel}
                  onChange={(e) => setFormData({ ...formData, maintenanceLevel: e.target.value })}
                />
                <Button 
                  onClick={handleSubmit} 
                  className="w-full"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingGrass ? "Update" : "Create"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {grassTypes.map((grass) => (
              <Card key={grass.id} className="border-border">
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Leaf className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{grass.name}</CardTitle>
                  </div>
                  <Badge variant={grass.isActive ? "default" : "secondary"}>
                    {grass.isActive ? "Active" : "Inactive"}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{grass.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Temp:</span>
                      <span className="ml-1 text-foreground">{grass.idealTemperature}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Water:</span>
                      <span className="ml-1 text-foreground">{grass.waterNeeds}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Sun:</span>
                      <span className="ml-1 text-foreground">{grass.sunRequirements}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Care:</span>
                      <span className="ml-1 text-foreground">{grass.maintenanceLevel}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(grass)}>
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => deleteMutation.mutate(grass.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
