import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Calendar, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface LawnCarePlan {
  id: number;
  title: string;
  description: string;
  season: string;
  month: number;
  taskType: string;
  instructions: string;
  tips: string;
  priority: string;
  isPremium: boolean;
  displayOrder: number;
  isActive: boolean;
}

export function AdminPlans() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<LawnCarePlan | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    season: "spring",
    month: 3,
    taskType: "fertilization",
    instructions: "",
    tips: "",
    priority: "medium",
    isPremium: false,
    displayOrder: 1,
  });

  const { data: plans = [], isLoading } = useQuery<LawnCarePlan[]>({
    queryKey: ["/api/admin/plans"],
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      apiRequest("/api/admin/plans", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({ title: "Plan created" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/plans"] });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number } & typeof formData) =>
      apiRequest(`/api/admin/plans/${data.id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({ title: "Plan updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/plans"] });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/admin/plans/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Plan deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/plans"] });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      season: "spring",
      month: 3,
      taskType: "fertilization",
      instructions: "",
      tips: "",
      priority: "medium",
      isPremium: false,
      displayOrder: 1,
    });
    setEditingPlan(null);
  };

  const handleEdit = (plan: LawnCarePlan) => {
    setEditingPlan(plan);
    setFormData({
      title: plan.title,
      description: plan.description || "",
      season: plan.season,
      month: plan.month,
      taskType: plan.taskType,
      instructions: plan.instructions || "",
      tips: plan.tips || "",
      priority: plan.priority,
      isPremium: plan.isPremium,
      displayOrder: plan.displayOrder || 1,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const seasonColors: Record<string, string> = {
    spring: "bg-green-500",
    summer: "bg-yellow-500",
    fall: "bg-orange-500",
    winter: "bg-blue-500",
  };

  const priorityColors: Record<string, string> = {
    high: "bg-red-500",
    medium: "bg-yellow-500",
    low: "bg-green-500",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Lawn Care Plans</h1>
            <p className="text-muted-foreground">Manage seasonal care tasks</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-plan">
                <Plus className="w-4 h-4 mr-2" />
                Add Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPlan ? "Edit" : "Add"} Care Plan</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Input
                    placeholder="Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Textarea
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <select
                  className="w-full p-2 border rounded-md"
                  value={formData.season}
                  onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                >
                  <option value="spring">Spring</option>
                  <option value="summer">Summer</option>
                  <option value="fall">Fall</option>
                  <option value="winter">Winter</option>
                </select>
                <Input
                  type="number"
                  placeholder="Month (1-12)"
                  min={1}
                  max={12}
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) || 1 })}
                />
                <select
                  className="w-full p-2 border rounded-md"
                  value={formData.taskType}
                  onChange={(e) => setFormData({ ...formData, taskType: e.target.value })}
                >
                  <option value="fertilization">Fertilization</option>
                  <option value="mowing">Mowing</option>
                  <option value="watering">Watering</option>
                  <option value="aeration">Aeration</option>
                  <option value="seeding">Seeding</option>
                  <option value="weed-control">Weed Control</option>
                  <option value="pest-control">Pest Control</option>
                </select>
                <select
                  className="w-full p-2 border rounded-md"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
                <div className="col-span-2">
                  <Textarea
                    placeholder="Instructions"
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Textarea
                    placeholder="Tips"
                    value={formData.tips}
                    onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
                  />
                </div>
                <Input
                  type="number"
                  placeholder="Display Order"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isPremium}
                    onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                  />
                  <span>Premium Only</span>
                </label>
                <div className="col-span-2">
                  <Button 
                    onClick={handleSubmit} 
                    className="w-full"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {editingPlan ? "Update" : "Create"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => (
              <Card key={plan.id} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-2 h-16 rounded-full ${priorityColors[plan.priority] || 'bg-gray-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{plan.title}</h3>
                        <Badge className={seasonColors[plan.season] || 'bg-gray-500'} variant="secondary">
                          {plan.season}
                        </Badge>
                        <Badge variant="outline">{plan.taskType}</Badge>
                        {plan.isPremium && <Badge className="bg-yellow-500">Premium</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Month {plan.month}
                        </span>
                        <span className="capitalize">{plan.priority} priority</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(plan)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => deleteMutation.mutate(plan.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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
