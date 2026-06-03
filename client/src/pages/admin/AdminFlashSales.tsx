import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Clock, TrendingDown } from "lucide-react";
import { useState } from "react";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminLayout } from "@/components/AdminLayout";

function AdminFlashSalesContent() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<any>(null);
  const [formData, setFormData] = useState({
    productId: "",
    title: "",
    description: "",
    originalPrice: "",
    salePrice: "",
    discountPercentage: "",
    startTime: "",
    endTime: "",
    stockLimit: "",
    isActive: true,
  });

  const { data: flashSales, isLoading } = useQuery({
    queryKey: ["admin", "flash-sales"],
    queryFn: () => api.admin.flashSales.getAll(),
  });

  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => api.products.getAll({}),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.admin.flashSales.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "flash-sales"] });
      queryClient.invalidateQueries({ queryKey: ["flash-sales"] });
      alert("Flash sale created successfully!");
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.admin.flashSales.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "flash-sales"] });
      queryClient.invalidateQueries({ queryKey: ["flash-sales"] });
      alert("Flash sale updated successfully!");
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.admin.flashSales.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "flash-sales"] });
      queryClient.invalidateQueries({ queryKey: ["flash-sales"] });
      alert("Flash sale deleted successfully!");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const originalPrice = parseFloat(formData.originalPrice);
    const salePrice = parseFloat(formData.salePrice);
    const startTime = new Date(formData.startTime);
    const endTime = new Date(formData.endTime);
    
    if (salePrice >= originalPrice) {
      alert("Sale price must be less than original price!");
      return;
    }
    
    if (endTime <= startTime) {
      alert("End time must be after start time!");
      return;
    }
    
    if (endTime <= new Date()) {
      alert("End time must be in the future!");
      return;
    }
    
    const submitData = {
      productId: parseInt(formData.productId),
      title: formData.title,
      description: formData.description || null,
      originalPrice,
      salePrice,
      discountPercentage: parseInt(formData.discountPercentage),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      stockLimit: formData.stockLimit ? parseInt(formData.stockLimit) : null,
      isActive: formData.isActive,
    };

    if (editingSale) {
      updateMutation.mutate({ id: editingSale.flashSale.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (sale: any) => {
    setEditingSale(sale);
    const startDate = new Date(sale.flashSale.startTime);
    const endDate = new Date(sale.flashSale.endTime);
    
    setFormData({
      productId: sale.flashSale.productId.toString(),
      title: sale.flashSale.title,
      description: sale.flashSale.description || "",
      originalPrice: sale.flashSale.originalPrice,
      salePrice: sale.flashSale.salePrice,
      discountPercentage: sale.flashSale.discountPercentage.toString(),
      startTime: startDate.toISOString().slice(0, 16),
      endTime: endDate.toISOString().slice(0, 16),
      stockLimit: sale.flashSale.stockLimit?.toString() || "",
      isActive: sale.flashSale.isActive,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this flash sale?")) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({
      productId: "",
      title: "",
      description: "",
      originalPrice: "",
      salePrice: "",
      discountPercentage: "",
      startTime: "",
      endTime: "",
      stockLimit: "",
      isActive: true,
    });
    setEditingSale(null);
    setIsFormOpen(false);
  };

  const calculateDiscount = () => {
    const original = parseFloat(formData.originalPrice);
    const sale = parseFloat(formData.salePrice);
    if (original > 0 && sale > 0 && original > sale) {
      const discount = Math.round(((original - sale) / original) * 100);
      setFormData({ ...formData, discountPercentage: discount.toString() });
    }
  };

  const isExpired = (endTime: string) => {
    return new Date(endTime) < new Date();
  };

  return (
    <AdminLayout>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Flash Sales Management</h1>
        <Button 
          onClick={() => setIsFormOpen(!isFormOpen)} 
          data-testid="button-new-flash-sale"
        >
          <Plus className="mr-2 h-4 w-4" />
          {isFormOpen ? "Cancel" : "New Flash Sale"}
        </Button>
      </div>

      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>{editingSale ? "Edit Flash Sale" : "Create New Flash Sale"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="productId">Product *</Label>
                  <select
                    id="productId"
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    data-testid="input-flash-product"
                  >
                    <option value="">Select a product</option>
                    {products?.map((product: any) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - ₹{product.price}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="title">Flash Sale Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="e.g., Limited Time Offer!"
                    data-testid="input-flash-title"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Optional description for the flash sale"
                  data-testid="input-flash-description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="originalPrice">Original Price *</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    onBlur={calculateDiscount}
                    required
                    data-testid="input-flash-original-price"
                  />
                </div>
                <div>
                  <Label htmlFor="salePrice">Sale Price *</Label>
                  <Input
                    id="salePrice"
                    type="number"
                    step="0.01"
                    value={formData.salePrice}
                    onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                    onBlur={calculateDiscount}
                    required
                    data-testid="input-flash-sale-price"
                  />
                </div>
                <div>
                  <Label htmlFor="discountPercentage">Discount % *</Label>
                  <Input
                    id="discountPercentage"
                    type="number"
                    value={formData.discountPercentage}
                    onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                    required
                    data-testid="input-flash-discount"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                    data-testid="input-flash-start-time"
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                    data-testid="input-flash-end-time"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="stockLimit">Stock Limit (Optional)</Label>
                <Input
                  id="stockLimit"
                  type="number"
                  value={formData.stockLimit}
                  onChange={(e) => setFormData({ ...formData, stockLimit: e.target.value })}
                  placeholder="Leave empty for unlimited"
                  data-testid="input-flash-stock-limit"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                  data-testid="input-flash-active"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex gap-3">
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-flash-sale"
                >
                  {editingSale ? "Update" : "Create"} Flash Sale
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} data-testid="button-cancel-flash">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Flash Sales</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : flashSales && flashSales.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Title</th>
                    <th className="text-left p-3">Product</th>
                    <th className="text-left p-3">Discount</th>
                    <th className="text-left p-3">Prices</th>
                    <th className="text-left p-3">Period</th>
                    <th className="text-left p-3">Stock</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-right p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {flashSales.map((sale: any) => (
                    <tr 
                      key={sale.flashSale.id} 
                      className="border-b hover:bg-gray-50" 
                      data-testid={`row-flash-sale-${sale.flashSale.id}`}
                    >
                      <td className="p-3 font-medium">{sale.flashSale.title}</td>
                      <td className="p-3">{sale.product.name}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-red-600 font-semibold">
                          <TrendingDown className="w-4 h-4" />
                          {sale.flashSale.discountPercentage}%
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="text-green-600 font-bold">₹{parseFloat(sale.flashSale.salePrice).toFixed(2)}</span>
                          <span className="text-gray-500 text-sm line-through">₹{parseFloat(sale.flashSale.originalPrice).toFixed(2)}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col text-sm">
                          <span>{new Date(sale.flashSale.startTime).toLocaleString()}</span>
                          <span className="text-gray-500">to {new Date(sale.flashSale.endTime).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        {sale.flashSale.stockLimit ? (
                          <span>{sale.flashSale.stockLimit - sale.flashSale.soldCount} / {sale.flashSale.stockLimit}</span>
                        ) : (
                          <span className="text-gray-500">Unlimited</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-1 rounded text-xs w-fit ${
                            sale.flashSale.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {sale.flashSale.isActive ? 'Active' : 'Inactive'}
                          </span>
                          {isExpired(sale.flashSale.endTime) && (
                            <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800 w-fit flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Expired
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2 justify-end">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEdit(sale)}
                            data-testid={`button-edit-flash-sale-${sale.flashSale.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleDelete(sale.flashSale.id)}
                            data-testid={`button-delete-flash-sale-${sale.flashSale.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8" data-testid="text-no-flash-sales">
              No flash sales yet. Create your first flash sale to boost sales!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
    </AdminLayout>
  );
}

export function AdminFlashSales() {
  return (
    <AdminGuard>
      <AdminFlashSalesContent />
    </AdminGuard>
  );
}
