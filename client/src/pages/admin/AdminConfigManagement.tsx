import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Settings, Plus, Trash2, Edit, Loader2, Lock, Key } from "lucide-react";

export function AdminConfigManagement() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    configKey: "",
    configValue: "",
    configType: "string",
    description: "",
    isSecret: false,
  });

  const { data: configs, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/configs"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("/api/admin/configs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/configs"] });
      toast({ title: "Success", description: "Config created" });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => apiRequest(`/api/admin/configs/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/configs"] });
      toast({ title: "Success", description: "Config updated" });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiRequest(`/api/admin/configs/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/configs"] });
      toast({ title: "Success", description: "Config deleted" });
    },
  });

  const resetForm = () => {
    setFormData({ configKey: "", configValue: "", configType: "string", description: "", isSecret: false });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const startEdit = (config: any) => {
    setFormData({
      configKey: config.configKey,
      configValue: config.isSecret ? "" : config.configValue || "",
      configType: config.configType || "string",
      description: config.description || "",
      isSecret: config.isSecret,
    });
    setEditingId(config.id);
    setShowForm(true);
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

  const configsByType = {
    firebase: configs?.filter((c) => c.configKey.toLowerCase().includes("firebase") || c.configKey.toLowerCase().includes("fcm")),
    stripe: configs?.filter((c) => c.configKey.toLowerCase().includes("stripe")),
    other: configs?.filter((c) => !c.configKey.toLowerCase().includes("firebase") && !c.configKey.toLowerCase().includes("fcm") && !c.configKey.toLowerCase().includes("stripe")),
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Configuration Management</h1>
            <p className="text-muted-foreground">Manage Firebase, Stripe, and other API configurations</p>
          </div>
          <Button onClick={() => { resetForm(); setShowForm(!showForm); }} data-testid="button-add-config">
            <Plus className="w-4 h-4 mr-2" /> Add Config
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingId ? "Edit Configuration" : "New Configuration"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Config Key *</label>
                    <Input
                      value={formData.configKey}
                      onChange={(e) => setFormData({ ...formData, configKey: e.target.value })}
                      placeholder="FIREBASE_API_KEY"
                      required
                      disabled={!!editingId}
                      data-testid="input-config-key"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <select className="w-full border rounded px-3 py-2" value={formData.configType} onChange={(e) => setFormData({ ...formData, configType: e.target.value })} data-testid="select-config-type">
                      <option value="string">String</option>
                      <option value="json">JSON</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Value {formData.isSecret && editingId && "(leave blank to keep current)"}</label>
                  <Textarea
                    value={formData.configValue}
                    onChange={(e) => setFormData({ ...formData, configValue: e.target.value })}
                    placeholder={formData.isSecret ? "••••••••" : "Configuration value"}
                    rows={3}
                    data-testid="input-config-value"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What is this config for?"
                    data-testid="input-config-desc"
                  />
                </div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.isSecret} onChange={(e) => setFormData({ ...formData, isSecret: e.target.checked })} data-testid="checkbox-secret" />
                  <Lock className="w-4 h-4" /> Mark as secret (value will be hidden)
                </label>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-config">
                    {editingId ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {[
          { title: "Firebase / FCM Configuration", icon: <Key className="w-5 h-5" />, data: configsByType.firebase },
          { title: "Stripe Configuration", icon: <Key className="w-5 h-5" />, data: configsByType.stripe },
          { title: "Other Configurations", icon: <Settings className="w-5 h-5" />, data: configsByType.other },
        ].map(({ title, icon, data }) => data && data.length > 0 && (
          <Card key={title} className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">{icon} {title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.map((config: any) => (
                  <div key={config.id} className="flex justify-between items-center p-3 border rounded" data-testid={`config-${config.id}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold">{config.configKey}</span>
                        {config.isSecret && <Lock className="w-3 h-3 text-muted-foreground" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{config.description || "No description"}</p>
                      <p className="text-xs font-mono mt-1">{config.configValue}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEdit(config)} data-testid={`button-edit-${config.id}`}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(config.id)} data-testid={`button-delete-${config.id}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {(!configs || configs.length === 0) && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No configurations yet. Add Firebase FCM or Stripe keys to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
