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
import { ShoppingBag, Plus, Pencil, Trash2, Loader2, Star, Percent } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FileUpload } from "@/components/FileUpload";

interface Deal {
  id: number;
  title: string;
  description: string;
  originalPrice: string;
  salePrice: string;
  discountPercent: number;
  store: string;
  storeUrl: string;
  imageUrl: string;
  category: string;
  startDate: string | null;
  expiresAt: string | null;
  affiliateLink: string | null;
  isFeatured: boolean;
  isActive: boolean;
}

export function AdminDeals() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    originalPrice: "",
    salePrice: "",
    discountPercent: 0,
    store: "",
    storeUrl: "",
    imageUrl: "",
    category: "Fertilizer",
    startDate: "",
    expiresAt: "",
    affiliateLink: "",
    isFeatured: false,
    isActive: true,
  });

  const { data: deals = [], isLoading } = useQuery<Deal[]>({
    queryKey: ["/api/admin/deals"],
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      apiRequest("/api/admin/deals", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({ title: "Deal created" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deals"] });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number } & typeof formData) =>
      apiRequest(`/api/admin/deals/${data.id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({ title: "Deal updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deals"] });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/admin/deals/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Deal deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deals"] });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      originalPrice: "",
      salePrice: "",
      discountPercent: 0,
      store: "",
      storeUrl: "",
      imageUrl: "",
      category: "Fertilizer",
      startDate: "",
      expiresAt: "",
      affiliateLink: "",
      isFeatured: false,
      isActive: true,
    });
    setEditingDeal(null);
  };

  const handleEdit = (deal: Deal) => {
    setEditingDeal(deal);
    setFormData({
      title: deal.title,
      description: deal.description || "",
      originalPrice: deal.originalPrice,
      salePrice: deal.salePrice,
      discountPercent: deal.discountPercent,
      store: deal.store,
      storeUrl: deal.storeUrl || "",
      imageUrl: deal.imageUrl || "",
      category: deal.category,
      startDate: deal.startDate ? new Date(deal.startDate).toISOString().slice(0, 16) : "",
      expiresAt: deal.expiresAt ? new Date(deal.expiresAt).toISOString().slice(0, 16) : "",
      affiliateLink: deal.affiliateLink || "",
      isFeatured: deal.isFeatured,
      isActive: deal.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingDeal) {
      updateMutation.mutate({ id: editingDeal.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Product Deals</h1>
              <p className="text-muted-foreground">Manage curated deals</p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-deal">
                <Plus className="w-4 h-4 mr-2" />
                Add Deal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingDeal ? "Edit" : "Add"} Deal</DialogTitle>
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
                <Input
                  placeholder="Original Price"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                />
                <Input
                  placeholder="Sale Price"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Discount %"
                  value={formData.discountPercent || ""}
                  onChange={(e) => setFormData({ ...formData, discountPercent: parseInt(e.target.value) || 0 })}
                />
                <select
                  className="w-full p-2 border rounded-md"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Fertilizer">Fertilizer</option>
                  <option value="Seed">Seed</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Tools">Tools</option>
                  <option value="Pest Control">Pest Control</option>
                </select>
                <Input
                  placeholder="Store Name"
                  value={formData.store}
                  onChange={(e) => setFormData({ ...formData, store: e.target.value })}
                />
                <Input
                  placeholder="Store URL"
                  value={formData.storeUrl}
                  onChange={(e) => setFormData({ ...formData, storeUrl: e.target.value })}
                />
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-1 block">Affiliate Link (optional)</label>
                  <Input
                    placeholder="https://affiliate.example.com/..."
                    value={formData.affiliateLink}
                    onChange={(e) => setFormData({ ...formData, affiliateLink: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Start Date</label>
                  <Input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">End Date</label>
                  <Input
                    type="datetime-local"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-1 block">Product Image</label>
                  <FileUpload
                    value={formData.imageUrl}
                    onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                    accept="image/*"
                    uploadType="image"
                    placeholder="Upload product image"
                  />
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  />
                  <span>Featured Deal</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span>Active (visible in API)</span>
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
                    {editingDeal ? "Update" : "Create"}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deals.map((deal) => (
              <Card key={deal.id} className={`border-border ${deal.isFeatured ? 'border-yellow-500/50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      {deal.imageUrl ? (
                        <img 
                          src={deal.imageUrl} 
                          alt={deal.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {deal.isFeatured && (
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        )}
                        <h3 className="font-semibold text-foreground line-clamp-1">{deal.title}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{deal.store}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-primary">${deal.salePrice}</span>
                        <span className="text-sm text-muted-foreground line-through">${deal.originalPrice}</span>
                        <Badge variant="destructive">
                          <Percent className="w-3 h-3 mr-1" />
                          {deal.discountPercent}%
                        </Badge>
                      </div>
                      <Badge variant="outline">{deal.category}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(deal)}>
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteMutation.mutate(deal.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
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
