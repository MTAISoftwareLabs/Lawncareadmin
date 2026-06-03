import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, FolderOpen, Plus, Trash2, Loader2, Eye, EyeOff, Crown } from "lucide-react";
import { FileUpload } from "@/components/FileUpload";

export function AdminLibrary() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("categories");
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "", iconUrl: "", displayOrder: 0 });
  const [itemForm, setItemForm] = useState({ categoryId: 0, title: "", summary: "", contentHtml: "", imageUrl: "", isPremium: false, displayOrder: 0 });

  const { data: categories, isLoading: loadingCategories } = useQuery<any[]>({
    queryKey: ["/api/admin/library-categories"],
  });

  const { data: items, isLoading: loadingItems } = useQuery<any[]>({
    queryKey: ["/api/admin/library-items"],
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("/api/admin/library-categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/library-categories"] });
      toast({ title: "Success", description: "Category created" });
      setCategoryForm({ name: "", description: "", iconUrl: "", displayOrder: 0 });
      setShowCategoryForm(false);
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => apiRequest(`/api/admin/library-categories/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/library-categories"] });
      toast({ title: "Success", description: "Category deleted" });
    },
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("/api/admin/library-items", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/library-items"] });
      toast({ title: "Success", description: "Item created" });
      setItemForm({ categoryId: 0, title: "", summary: "", contentHtml: "", imageUrl: "", isPremium: false, displayOrder: 0 });
      setShowItemForm(false);
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => apiRequest(`/api/admin/library-items/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/library-items"] });
      toast({ title: "Success", description: "Item deleted" });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => apiRequest(`/api/admin/library-items/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/library-items"] });
      toast({ title: "Success", description: "Item updated" });
    },
  });

  const isLoading = loadingCategories || loadingItems;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Content Library</h1>
              <p className="text-muted-foreground">Manage library categories and content items</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="categories" data-testid="tab-categories">
              <FolderOpen className="w-4 h-4 mr-2" /> Categories
            </TabsTrigger>
            <TabsTrigger value="items" data-testid="tab-items">
              <BookOpen className="w-4 h-4 mr-2" /> Items
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setShowCategoryForm(!showCategoryForm)} data-testid="button-add-category">
                <Plus className="w-4 h-4 mr-2" /> Add Category
              </Button>
            </div>

            {showCategoryForm && (
              <Card className="mb-4">
                <CardHeader><CardTitle>New Category</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={(e) => { e.preventDefault(); createCategoryMutation.mutate(categoryForm); }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input placeholder="Category Name" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} required data-testid="input-cat-name" />
                      <Input type="number" placeholder="Display Order" value={categoryForm.displayOrder} onChange={(e) => setCategoryForm({ ...categoryForm, displayOrder: parseInt(e.target.value) || 0 })} data-testid="input-cat-order" />
                    </div>
                    <Textarea placeholder="Description" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} data-testid="input-cat-desc" />
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Category Icon</label>
                      <FileUpload value={categoryForm.iconUrl} onChange={(url) => setCategoryForm({ ...categoryForm, iconUrl: url })} accept="image/*" uploadType="image" placeholder="Upload category icon" />
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => setShowCategoryForm(false)}>Cancel</Button>
                      <Button type="submit" disabled={createCategoryMutation.isPending} data-testid="button-submit-category">Create</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {categories?.map((cat) => (
                <Card key={cat.id} data-testid={`cat-${cat.id}`}>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {cat.iconUrl ? <img src={cat.iconUrl} alt="" className="w-10 h-10 rounded" /> : <FolderOpen className="w-10 h-10 text-muted-foreground" />}
                      <div>
                        <h3 className="font-semibold">{cat.name}</h3>
                        <p className="text-sm text-muted-foreground">{cat.description || "No description"}</p>
                      </div>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => deleteCategoryMutation.mutate(cat.id)} data-testid={`button-delete-cat-${cat.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="items">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setShowItemForm(!showItemForm)} data-testid="button-add-item">
                <Plus className="w-4 h-4 mr-2" /> Add Item
              </Button>
            </div>

            {showItemForm && (
              <Card className="mb-4">
                <CardHeader><CardTitle>New Library Item</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={(e) => { e.preventDefault(); createItemMutation.mutate(itemForm); }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <select className="border rounded px-3 py-2" value={itemForm.categoryId} onChange={(e) => setItemForm({ ...itemForm, categoryId: parseInt(e.target.value) })} required data-testid="select-item-category">
                        <option value={0}>Select Category</option>
                        {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <Input type="number" placeholder="Display Order" value={itemForm.displayOrder} onChange={(e) => setItemForm({ ...itemForm, displayOrder: parseInt(e.target.value) || 0 })} data-testid="input-item-order" />
                    </div>
                    <Input placeholder="Title" value={itemForm.title} onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })} required data-testid="input-item-title" />
                    <Input placeholder="Summary" value={itemForm.summary} onChange={(e) => setItemForm({ ...itemForm, summary: e.target.value })} data-testid="input-item-summary" />
                    <Textarea placeholder="Content (HTML)" value={itemForm.contentHtml} onChange={(e) => setItemForm({ ...itemForm, contentHtml: e.target.value })} rows={6} required data-testid="input-item-content" />
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Item Image</label>
                      <FileUpload value={itemForm.imageUrl} onChange={(url) => setItemForm({ ...itemForm, imageUrl: url })} accept="image/*" uploadType="image" placeholder="Upload item image" />
                    </div>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={itemForm.isPremium} onChange={(e) => setItemForm({ ...itemForm, isPremium: e.target.checked })} data-testid="checkbox-premium" />
                      <Crown className="w-4 h-4 text-yellow-500" /> Premium Content
                    </label>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => setShowItemForm(false)}>Cancel</Button>
                      <Button type="submit" disabled={createItemMutation.isPending} data-testid="button-submit-item">Create</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {items?.map((item: any) => (
                <Card key={item.item.id} data-testid={`item-${item.item.id}`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        {item.item.imageUrl ? <img src={item.item.imageUrl} alt="" className="w-16 h-16 rounded object-cover" /> : <BookOpen className="w-16 h-16 text-muted-foreground" />}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{item.item.title}</h3>
                            {item.item.isPremium && <Crown className="w-4 h-4 text-yellow-500" />}
                          </div>
                          <p className="text-sm text-muted-foreground">{item.category?.name || "Unknown Category"}</p>
                          <p className="text-sm text-muted-foreground mt-1">{item.item.summary}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant={item.item.isActive ? "outline" : "ghost"} size="sm" onClick={() => updateItemMutation.mutate({ id: item.item.id, data: { isActive: !item.item.isActive } })} data-testid={`button-toggle-item-${item.item.id}`}>
                          {item.item.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteItemMutation.mutate(item.item.id)} data-testid={`button-delete-item-${item.item.id}`}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
