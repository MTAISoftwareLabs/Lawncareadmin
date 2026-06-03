import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Phone, Mail, Car, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDeliveryPartners() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    vehicleType: "",
    vehicleNumber: "",
    assignedAreas: "",
    isActive: true,
  });

  const { data: partners, isLoading } = useQuery({
    queryKey: ["/api/admin/delivery-partners"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/admin/delivery-partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/delivery-partners"] });
      toast({ title: "Delivery partner created successfully!" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to create delivery partner", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/admin/delivery-partners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/delivery-partners"] });
      toast({ title: "Delivery partner updated successfully!" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to update delivery partner", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/delivery-partners/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/delivery-partners"] });
      toast({ title: "Delivery partner deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to delete delivery partner", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      vehicleType: "",
      vehicleNumber: "",
      assignedAreas: "",
      isActive: true,
    });
    setEditingPartner(null);
    setShowForm(false);
  };

  const handleEdit = (partner: any) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      email: partner.email,
      phone: partner.phone,
      vehicleType: partner.vehicleType,
      vehicleNumber: partner.vehicleNumber || "",
      assignedAreas: partner.assignedAreas || "",
      isActive: partner.isActive,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPartner) {
      updateMutation.mutate({ id: editingPartner.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this delivery partner?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Delivery Partners</h1>
            <p className="text-gray-600">Manage your delivery team</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} data-testid="button-add-partner">
            <Plus className="h-4 w-4 mr-2" />
            Add Delivery Partner
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingPartner ? "Edit" : "Add"} Delivery Partner</CardTitle>
              <CardDescription>Enter delivery partner details below</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      data-testid="input-partner-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      data-testid="input-partner-email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      data-testid="input-partner-phone"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vehicleType">Vehicle Type *</Label>
                    <Select value={formData.vehicleType} onValueChange={(value) => setFormData({ ...formData, vehicleType: value })}>
                      <SelectTrigger data-testid="select-vehicle-type">
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bike">Bike</SelectItem>
                        <SelectItem value="Scooter">Scooter</SelectItem>
                        <SelectItem value="Car">Car</SelectItem>
                        <SelectItem value="Van">Van</SelectItem>
                        <SelectItem value="Truck">Truck</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                    <Input
                      id="vehicleNumber"
                      value={formData.vehicleNumber}
                      onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                      placeholder="e.g., MH01AB1234"
                      data-testid="input-vehicle-number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="assignedAreas">Assigned Areas</Label>
                    <Input
                      id="assignedAreas"
                      value={formData.assignedAreas}
                      onChange={(e) => setFormData({ ...formData, assignedAreas: e.target.value })}
                      placeholder="e.g., Mumbai, Thane"
                      data-testid="input-assigned-areas"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                    data-testid="checkbox-is-active"
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit">
                    {editingPartner ? "Update" : "Create"} Partner
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm} data-testid="button-cancel">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="text-center py-8">Loading delivery partners...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners?.map((partner: any) => (
              <Card key={partner.id} className={!partner.isActive ? "opacity-60" : ""}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{partner.name}</CardTitle>
                      <CardDescription>
                        {partner.isActive ? (
                          <span className="text-green-600 font-semibold">Active</span>
                        ) : (
                          <span className="text-gray-500">Inactive</span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(partner)} data-testid={`button-edit-${partner.id}`}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(partner.id)} data-testid={`button-delete-${partner.id}`}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{partner.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{partner.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-gray-500" />
                    <span>{partner.vehicleType} {partner.vehicleNumber && `(${partner.vehicleNumber})`}</span>
                  </div>
                  {partner.assignedAreas && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">{partner.assignedAreas}</span>
                    </div>
                  )}
                  <div className="pt-2 mt-2 border-t">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Total Deliveries</span>
                      <span className="font-semibold text-gray-900">{partner.totalDeliveries || 0}</span>
                    </div>
                    {partner.rating && partner.rating > 0 && (
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Rating</span>
                        <span className="font-semibold text-gray-900">{partner.rating} ⭐</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {partners?.length === 0 && !isLoading && (
          <div className="text-center py-16 text-gray-500">
            <p>No delivery partners found. Add your first delivery partner to get started!</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
