import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminLayout } from "@/components/AdminLayout";
import { Plus, Trash2, X, Tag } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function AdminPromoCodesContent() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minPurchase: "0",
    maxDiscount: "",
    validFrom: "",
    validUntil: "",
  });

  const { data: promoCodes, isLoading } = useQuery({
    queryKey: ["admin-promo-codes"],
    queryFn: api.admin.promoCodes.getAll,
  });

  const createMutation = useMutation({
    mutationFn: api.admin.promoCodes.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promo-codes"] });
      resetForm();
      alert("Promo code created successfully!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.admin.promoCodes.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promo-codes"] });
      alert("Promo code deleted successfully!");
    },
  });

  const resetForm = () => {
    setFormData({
      code: "",
      discountType: "percentage",
      discountValue: "",
      minPurchase: "0",
      maxDiscount: "",
      validFrom: "",
      validUntil: "",
    });
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      discountValue: parseFloat(formData.discountValue),
      minPurchase: parseFloat(formData.minPurchase),
      maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
    <div className="p-6 bg-white min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Promo Codes Management</h1>
        {!showForm && (
          <Button 
            onClick={() => setShowForm(true)} 
            className="bg-green-600 hover:bg-green-700 text-white"
            data-testid="button-add-promo"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Promo Code
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6"
          >
            <Card className="p-6 bg-white">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Create Promo Code</h2>
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Promo Code *</label>
                  <Input
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="SUMMER2024"
                    data-testid="input-promo-code"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Discount Type *</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    data-testid="select-discount-type"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Discount Value *</label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    placeholder={formData.discountType === "percentage" ? "10" : "100"}
                    data-testid="input-discount-value"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Minimum Purchase Amount</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                    placeholder="500"
                    data-testid="input-min-purchase"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Maximum Discount (Optional)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    placeholder="500"
                    data-testid="input-max-discount"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Valid From *</label>
                    <Input
                      required
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      data-testid="input-valid-from"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Valid Until *</label>
                    <Input
                      required
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      data-testid="input-valid-until"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={resetForm} data-testid="button-cancel-promo">
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white" 
                    data-testid="button-submit-promo"
                  >
                    Create Promo Code
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

        <div className="grid gap-4">
          {promoCodes?.map((promo: any) => (
            <Card key={promo.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                    <Tag className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">{promo.code}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {promo.discountType === "percentage" 
                        ? `${promo.discountValue}% OFF` 
                        : `₹${promo.discountValue} OFF`}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Min Purchase: ₹{promo.minPurchase}
                      {promo.maxDiscount && ` | Max Discount: ₹${promo.maxDiscount}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      Valid: {new Date(promo.validFrom).toLocaleDateString()} - {new Date(promo.validUntil).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm(`Delete promo code "${promo.code}"?`)) {
                      deleteMutation.mutate(promo.id);
                    }
                  }}
                  data-testid={`button-delete-promo-${promo.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}

          {promoCodes?.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-gray-600">No promo codes found. Create your first promo code!</p>
            </Card>
          )}
        </div>
    </div>
    </AdminLayout>
  );
}

export function AdminPromoCodes() {
  return (
    <AdminGuard>
      <AdminPromoCodesContent />
    </AdminGuard>
  );
}
