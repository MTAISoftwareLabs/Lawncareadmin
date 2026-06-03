import { useQuery, useMutation } from "@tanstack/react-query";
import { api, queryClient } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Plus, Trash2, Edit2, Save, X } from "lucide-react";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminLayout } from "@/components/AdminLayout";
import { useState } from "react";

function AdminPagesContent() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    content: "",
    isActive: true,
  });

  const { data: pages, isLoading } = useQuery({
    queryKey: ["admin-pages"],
    queryFn: api.admin.pages.getAll,
  });

  const createMutation = useMutation({
    mutationFn: api.admin.pages.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
      setIsCreating(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.admin.pages.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
      setEditingId(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.admin.pages.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
    },
  });

  const resetForm = () => {
    setFormData({
      slug: "",
      title: "",
      content: "",
      isActive: true,
    });
  };

  const handleEdit = (page: any) => {
    setEditingId(page.id);
    setFormData({
      slug: page.slug,
      title: page.title,
      content: page.content,
      isActive: page.isActive,
    });
  };

  const handleSave = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
    resetForm();
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this page?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <AdminLayout>
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-8">
        <div className="container mx-auto px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">CMS - Static Pages</h1>
              <p className="text-green-100 mt-2">Manage About Us, Privacy Policy, Terms, etc.</p>
            </div>
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-white text-green-600 hover:bg-green-50"
              data-testid="button-add-page"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Page
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-8 py-8">
        {(isCreating || editingId) && (
          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingId ? "Edit Page" : "Add New Page"}
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="slug">Slug (URL path, e.g., "about-us")</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="about-us"
                  data-testid="input-slug"
                />
              </div>

              <div>
                <Label htmlFor="title">Page Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="About Us"
                  data-testid="input-title"
                />
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Page content..."
                  rows={12}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  data-testid="input-content"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-4 h-4"
                  data-testid="checkbox-is-active"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  disabled={
                    !formData.slug ||
                    !formData.title ||
                    !formData.content ||
                    createMutation.isPending ||
                    updateMutation.isPending
                  }
                  data-testid="button-save-page"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {editingId ? "Update" : "Create"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  data-testid="button-cancel"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {pages && pages.length > 0 ? (
              pages.map((page: any) => (
                <Card
                  key={page.id}
                  className="p-6"
                  data-testid={`page-${page.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-green-600" />
                        <div>
                          <h3 className="font-bold text-lg">{page.title}</h3>
                          <p className="text-sm text-gray-600">/{page.slug}</p>
                        </div>
                        {!page.isActive && (
                          <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 mt-3 line-clamp-3">
                        {page.content.substring(0, 200)}...
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Last updated: {new Date(page.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(page)}
                        data-testid={`button-edit-${page.id}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(page.id)}
                        className="text-red-600 hover:bg-red-50"
                        data-testid={`button-delete-${page.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Pages Yet</h3>
                <p className="text-gray-600 mb-4">
                  Create your first static page (About Us, Privacy Policy, etc.)
                </p>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Page
                </Button>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
    </AdminLayout>
  );
}

export function AdminPages() {
  return (
    <AdminGuard>
      <AdminPagesContent />
    </AdminGuard>
  );
}
