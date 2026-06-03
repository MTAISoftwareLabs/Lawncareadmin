import { useState } from "react";
import * as React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, FileText, Plus, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminTax() {
  const { toast } = useToast();
  const [editingRate, setEditingRate] = useState<any>(null);
  const [newRate, setNewRate] = useState({ name: "", type: "GST", rate: 18, state: "", isActive: true });

  const { data: taxRates = [] } = useQuery<any[]>({ queryKey: ["/api/admin/tax/rates"] });
  const { data: compliance } = useQuery<any>({ queryKey: ["/api/admin/compliance"] });

  const [complianceForm, setComplianceForm] = useState({
    businessName: "",
    gstNumber: "",
    panNumber: "",
    tanNumber: "",
    cinNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    email: "",
    enableGst: true,
    defaultTaxRate: 18,
    taxInclusive: false,
  });

  React.useEffect(() => {
    if (compliance) {
      setComplianceForm(compliance);
    }
  }, [compliance]);

  const createRateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/admin/tax/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tax/rates"] });
      toast({ title: "Tax rate created successfully!" });
      setNewRate({ name: "", type: "GST", rate: 18, state: "", isActive: true });
    },
  });

  const updateRateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/admin/tax/rates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tax/rates"] });
      toast({ title: "Tax rate updated successfully!" });
      setEditingRate(null);
    },
  });

  const deleteRateMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/tax/rates/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tax/rates"] });
      toast({ title: "Tax rate deleted successfully!" });
    },
  });

  const updateComplianceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/admin/compliance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/compliance"] });
      toast({ title: "Compliance settings updated successfully!" });
    },
  });

  const handleCreateRate = () => {
    if (!newRate.name || newRate.rate <= 0) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    createRateMutation.mutate(newRate);
  };

  const handleUpdateRate = (rate: any) => {
    updateRateMutation.mutate({ id: rate.id, data: rate });
  };

  const handleDeleteRate = (id: number) => {
    if (confirm("Are you sure you want to delete this tax rate?")) {
      deleteRateMutation.mutate(id);
    }
  };

  const handleSaveCompliance = () => {
    updateComplianceMutation.mutate(complianceForm);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calculator className="h-8 w-8" />
            Tax & Compliance Management
          </h1>
          <p className="text-gray-600">Manage tax rates and business compliance</p>
        </div>

        <Tabs defaultValue="rates" className="w-full">
          <TabsList>
            <TabsTrigger value="rates">
              <Calculator className="h-4 w-4 mr-2" />
              Tax Rates
            </TabsTrigger>
            <TabsTrigger value="compliance">
              <FileText className="h-4 w-4 mr-2" />
              Compliance Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Tax Rate</CardTitle>
                <CardDescription>Create GST, CGST, SGST, or custom tax rates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tax Name</Label>
                    <Input
                      value={newRate.name}
                      onChange={(e) => setNewRate({ ...newRate, name: e.target.value })}
                      placeholder="CGST 9%"
                      data-testid="input-tax-name"
                    />
                  </div>
                  <div>
                    <Label>Tax Type</Label>
                    <Select value={newRate.type} onValueChange={(val) => setNewRate({ ...newRate, type: val })}>
                      <SelectTrigger data-testid="select-tax-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GST">GST</SelectItem>
                        <SelectItem value="CGST">CGST</SelectItem>
                        <SelectItem value="SGST">SGST</SelectItem>
                        <SelectItem value="IGST">IGST</SelectItem>
                        <SelectItem value="CESS">CESS</SelectItem>
                        <SelectItem value="Custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Tax Rate (%)</Label>
                    <Input
                      type="number"
                      value={newRate.rate}
                      onChange={(e) => setNewRate({ ...newRate, rate: parseFloat(e.target.value) })}
                      data-testid="input-tax-rate"
                    />
                  </div>
                  <div>
                    <Label>State (Optional)</Label>
                    <Input
                      value={newRate.state}
                      onChange={(e) => setNewRate({ ...newRate, state: e.target.value })}
                      placeholder="Maharashtra"
                      data-testid="input-tax-state"
                    />
                  </div>
                </div>
                <Button onClick={handleCreateRate} disabled={createRateMutation.isPending} data-testid="button-create-rate">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tax Rate
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Tax Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {taxRates?.length === 0 && (
                    <p className="text-center py-8 text-gray-500">No tax rates configured</p>
                  )}
                  {taxRates?.map((rate: any) => (
                    <div key={rate.id} className="border rounded-lg p-4 flex items-center justify-between">
                      {editingRate?.id === rate.id ? (
                        <div className="flex-1 grid grid-cols-4 gap-2">
                          <Input
                            value={editingRate.name}
                            onChange={(e) => setEditingRate({ ...editingRate, name: e.target.value })}
                          />
                          <Input
                            type="number"
                            value={editingRate.rate}
                            onChange={(e) => setEditingRate({ ...editingRate, rate: parseFloat(e.target.value) })}
                          />
                          <Input
                            value={editingRate.state || ""}
                            onChange={(e) => setEditingRate({ ...editingRate, state: e.target.value })}
                            placeholder="State"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleUpdateRate(editingRate)}>Save</Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingRate(null)}>Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{rate.name}</span>
                              <span className="text-xs px-2 py-1 rounded bg-gray-100">{rate.type}</span>
                              {!rate.isActive && <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-800">Inactive</span>}
                            </div>
                            <p className="text-sm text-gray-600">Rate: {rate.rate}%{rate.state ? ` | State: ${rate.state}` : ""}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setEditingRate(rate)} data-testid={`button-edit-rate-${rate.id}`}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteRate(rate.id)} data-testid={`button-delete-rate-${rate.id}`}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance">
            <Card>
              <CardHeader>
                <CardTitle>Business Compliance Information</CardTitle>
                <CardDescription>GST, PAN, TAN, and other regulatory details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Business Name</Label>
                    <Input
                      value={complianceForm.businessName}
                      onChange={(e) => setComplianceForm({ ...complianceForm, businessName: e.target.value })}
                      data-testid="input-business-name"
                    />
                  </div>
                  <div>
                    <Label>GST Number</Label>
                    <Input
                      value={complianceForm.gstNumber}
                      onChange={(e) => setComplianceForm({ ...complianceForm, gstNumber: e.target.value })}
                      placeholder="22AAAAA0000A1Z5"
                      data-testid="input-gst-number"
                    />
                  </div>
                  <div>
                    <Label>PAN Number</Label>
                    <Input
                      value={complianceForm.panNumber}
                      onChange={(e) => setComplianceForm({ ...complianceForm, panNumber: e.target.value })}
                      placeholder="ABCDE1234F"
                      data-testid="input-pan-number"
                    />
                  </div>
                  <div>
                    <Label>TAN Number</Label>
                    <Input
                      value={complianceForm.tanNumber}
                      onChange={(e) => setComplianceForm({ ...complianceForm, tanNumber: e.target.value })}
                      placeholder="ABCD12345E"
                      data-testid="input-tan-number"
                    />
                  </div>
                  <div>
                    <Label>CIN Number</Label>
                    <Input
                      value={complianceForm.cinNumber}
                      onChange={(e) => setComplianceForm({ ...complianceForm, cinNumber: e.target.value })}
                      placeholder="U12345MH2020PTC123456"
                      data-testid="input-cin-number"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Address</Label>
                    <Input
                      value={complianceForm.address}
                      onChange={(e) => setComplianceForm({ ...complianceForm, address: e.target.value })}
                      data-testid="input-address"
                    />
                  </div>
                  <div>
                    <Label>City</Label>
                    <Input
                      value={complianceForm.city}
                      onChange={(e) => setComplianceForm({ ...complianceForm, city: e.target.value })}
                      data-testid="input-city"
                    />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input
                      value={complianceForm.state}
                      onChange={(e) => setComplianceForm({ ...complianceForm, state: e.target.value })}
                      data-testid="input-state"
                    />
                  </div>
                  <div>
                    <Label>Pincode</Label>
                    <Input
                      value={complianceForm.pincode}
                      onChange={(e) => setComplianceForm({ ...complianceForm, pincode: e.target.value })}
                      data-testid="input-pincode"
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={complianceForm.phone}
                      onChange={(e) => setComplianceForm({ ...complianceForm, phone: e.target.value })}
                      data-testid="input-phone"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={complianceForm.email}
                      onChange={(e) => setComplianceForm({ ...complianceForm, email: e.target.value })}
                      data-testid="input-email"
                    />
                  </div>
                </div>

                <div className="border-t pt-4 space-y-4">
                  <h3 className="font-semibold">Tax Configuration</h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="enableGst"
                      checked={complianceForm.enableGst}
                      onChange={(e) => setComplianceForm({ ...complianceForm, enableGst: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300"
                      data-testid="checkbox-enable-gst"
                    />
                    <Label htmlFor="enableGst" className="cursor-pointer">Enable GST</Label>
                  </div>
                  <div>
                    <Label>Default Tax Rate (%)</Label>
                    <Input
                      type="number"
                      value={complianceForm.defaultTaxRate}
                      onChange={(e) => setComplianceForm({ ...complianceForm, defaultTaxRate: parseFloat(e.target.value) })}
                      data-testid="input-default-tax-rate"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="taxInclusive"
                      checked={complianceForm.taxInclusive}
                      onChange={(e) => setComplianceForm({ ...complianceForm, taxInclusive: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300"
                      data-testid="checkbox-tax-inclusive"
                    />
                    <Label htmlFor="taxInclusive" className="cursor-pointer">Prices Include Tax</Label>
                  </div>
                </div>

                <Button
                  onClick={handleSaveCompliance}
                  disabled={updateComplianceMutation.isPending}
                  data-testid="button-save-compliance"
                >
                  Save Compliance Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
