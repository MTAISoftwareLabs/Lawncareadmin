import { useQuery, useMutation } from "@tanstack/react-query";
import { api, queryClient } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HelpCircle, Plus, Trash2, Edit2, Save, X } from "lucide-react";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminLayout } from "@/components/AdminLayout";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FAQ_CATEGORIES = [
  "Orders",
  "Shipping",
  "Returns",
  "Payments",
  "Account",
  "Products",
  "General"
];

function AdminFaqsContent() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "General",
    displayOrder: 0,
    isActive: true,
  });

  const { data: faqs, isLoading } = useQuery({
    queryKey: ["admin-faqs"],
    queryFn: api.admin.faqs.getAll,
  });

  const createMutation = useMutation({
    mutationFn: api.admin.faqs.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
      setIsCreating(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.admin.faqs.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
      setEditingId(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.admin.faqs.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
    },
  });

  const resetForm = () => {
    setFormData({
      question: "",
      answer: "",
      category: "General",
      displayOrder: 0,
      isActive: true,
    });
  };

  const handleEdit = (faq: any) => {
    setEditingId(faq.id);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      displayOrder: faq.displayOrder,
      isActive: faq.isActive,
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
    if (confirm("Are you sure you want to delete this FAQ?")) {
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
              <h1 className="text-4xl font-bold">FAQ Management</h1>
              <p className="text-green-100 mt-2">Manage help center questions</p>
            </div>
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-white text-green-600 hover:bg-green-50"
              data-testid="button-add-faq"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add FAQ
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-8 py-8">
        {(isCreating || editingId) && (
          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingId ? "Edit FAQ" : "Add New FAQ"}
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger data-testid="select-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FAQ_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="question">Question</Label>
                <Input
                  id="question"
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                  placeholder="Enter the question..."
                  data-testid="input-question"
                />
              </div>

              <div>
                <Label htmlFor="answer">Answer</Label>
                <textarea
                  id="answer"
                  value={formData.answer}
                  onChange={(e) =>
                    setFormData({ ...formData, answer: e.target.value })
                  }
                  placeholder="Enter the answer..."
                  rows={5}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  data-testid="input-answer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="displayOrder">Display Order</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        displayOrder: parseInt(e.target.value) || 0,
                      })
                    }
                    data-testid="input-display-order"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-8">
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
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  disabled={
                    !formData.question ||
                    !formData.answer ||
                    createMutation.isPending ||
                    updateMutation.isPending
                  }
                  data-testid="button-save-faq"
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
              <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {FAQ_CATEGORIES.map((category) => {
              const categoryFaqs = faqs?.filter(
                (faq: any) => faq.category === category
              );
              if (!categoryFaqs || categoryFaqs.length === 0) return null;

              return (
                <div key={category}>
                  <h3 className="text-xl font-bold mb-3 text-green-700">
                    {category}
                  </h3>
                  <div className="space-y-3 mb-6">
                    {categoryFaqs.map((faq: any) => (
                      <Card
                        key={faq.id}
                        className="p-4"
                        data-testid={`faq-${faq.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <HelpCircle className="h-5 w-5 text-green-600" />
                              <h4 className="font-semibold">{faq.question}</h4>
                              {!faq.isActive && (
                                <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <p className="text-gray-700 mt-2 ml-7">{faq.answer}</p>
                            <p className="text-xs text-gray-500 mt-2 ml-7">
                              Order: {faq.displayOrder}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(faq)}
                              data-testid={`button-edit-${faq.id}`}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(faq.id)}
                              className="text-red-600 hover:bg-red-50"
                              data-testid={`button-delete-${faq.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
            {!faqs || faqs.length === 0 && (
              <Card className="p-12 text-center">
                <HelpCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No FAQs Yet</h3>
                <p className="text-gray-600 mb-4">
                  Start by adding your first FAQ to help your customers
                </p>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First FAQ
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

export function AdminFaqs() {
  return (
    <AdminGuard>
      <AdminFaqsContent />
    </AdminGuard>
  );
}
