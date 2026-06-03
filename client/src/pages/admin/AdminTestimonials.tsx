import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminLayout } from "@/components/AdminLayout";
import { Star, Trash2, Edit, Plus, Check, X, Upload } from "lucide-react";
import { useState, Component, ErrorInfo } from "react";
import { Input } from "@/components/ui/input";

class ErrorBoundary extends Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("AdminTestimonials Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <h1 className="text-xl font-bold text-red-600">Error loading testimonials</h1>
          <p className="text-muted-foreground mt-2">{this.state.error?.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

type Testimonial = {
  id: number;
  customerName: string;
  customerImage: string | null;
  rating: number;
  testimonial: string;
  isFeatured: boolean;
  isApproved: boolean;
  createdAt: string;
};

type TestimonialFormData = {
  customerName: string;
  customerImage: string;
  rating: number;
  testimonial: string;
  isFeatured: boolean;
  isApproved: boolean;
};

function AdminTestimonialsContent() {
  const [showForm, setShowForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<TestimonialFormData>({
    customerName: "",
    customerImage: "",
    rating: 5,
    testimonial: "",
    isFeatured: false,
    isApproved: false,
  });

  const { data: testimonials = [] } = useQuery<Testimonial[]>({
    queryKey: ["/api/admin/testimonials"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: TestimonialFormData) => {
      return apiRequest("/api/admin/testimonials", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonials"] });
      alert("Testimonial created successfully!");
      handleCancel();
    },
    onError: () => {
      alert("Failed to create testimonial. Please try again.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: TestimonialFormData }) => {
      return apiRequest(`/api/admin/testimonials/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonials"] });
      alert("Testimonial updated successfully!");
      handleCancel();
    },
    onError: () => {
      alert("Failed to update testimonial. Please try again.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/testimonials/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonials"] });
      alert("Testimonial deleted successfully!");
    },
    onError: () => {
      alert("Failed to delete testimonial. Please try again.");
    },
  });

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      customerName: testimonial.customerName,
      customerImage: testimonial.customerImage || "",
      rating: testimonial.rating,
      testimonial: testimonial.testimonial,
      isFeatured: testimonial.isFeatured,
      isApproved: testimonial.isApproved,
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this testimonial?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.testimonial) {
      alert("Customer name and testimonial are required");
      return;
    }
    
    if (formData.testimonial.length < 10) {
      alert("Testimonial must be at least 10 characters");
      return;
    }

    if (editingTestimonial) {
      updateMutation.mutate({ id: editingTestimonial.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTestimonial(null);
    setFormData({
      customerName: "",
      customerImage: "",
      rating: 5,
      testimonial: "",
      isFeatured: false,
      isApproved: false,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      setUploading(true);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setFormData({ ...formData, customerImage: data.url });
    } catch (error) {
      alert("Failed to upload image");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminLayout>
    <div className="p-6 bg-background min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Testimonials Management</h1>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
            data-testid="button-add-testimonial"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Testimonial
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingTestimonial ? "Edit Testimonial" : "Add New Testimonial"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Customer Name *</label>
              <Input
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="John Doe"
                required
                data-testid="input-customer-name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Customer Image (Optional)</label>
              <div className="space-y-4">
                {formData.customerImage && (
                  <div className="relative w-24 h-24">
                    <img
                      src={formData.customerImage}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-full"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, customerImage: "" })}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-600 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {uploading ? "Uploading..." : "Click to upload customer image"}
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    data-testid="input-customer-image"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Rating (1-5) *</label>
              <Input
                type="number"
                min="1"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) || 5 })}
                required
                data-testid="input-rating"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Testimonial *</label>
              <textarea
                value={formData.testimonial}
                onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
                placeholder="Share your experience..."
                className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
                data-testid="input-testimonial"
              />
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4"
                  data-testid="checkbox-featured"
                />
                <span className="text-sm font-medium">Featured</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isApproved}
                  onChange={(e) => setFormData({ ...formData, isApproved: e.target.checked })}
                  className="w-4 h-4"
                  data-testid="checkbox-approved"
                />
                <span className="text-sm font-medium">Approved</span>
              </label>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-submit-testimonial"
              >
                {editingTestimonial ? "Update" : "Create"} Testimonial
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                data-testid="button-cancel-testimonial"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Testimonial</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {testimonials.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No testimonials found. Click "Add Testimonial" to create one.
                  </td>
                </tr>
              ) : (
                testimonials.map((testimonial) => (
                  <tr key={testimonial.id} className="hover:bg-muted/50" data-testid={`row-testimonial-${testimonial.id}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {testimonial.customerImage ? (
                          <img
                            src={testimonial.customerImage}
                            alt={testimonial.customerName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-green-600 font-semibold">
                              {testimonial.customerName ? testimonial.customerName.charAt(0).toUpperCase() : "?"}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{testimonial.customerName || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">
                            {testimonial.createdAt ? new Date(testimonial.createdAt).toLocaleDateString() : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-muted-foreground line-clamp-2 max-w-md">
                        {testimonial.testimonial}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {testimonial.isApproved && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 w-fit">
                            <Check className="w-3 h-3" />
                            Approved
                          </span>
                        )}
                        {!testimonial.isApproved && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-muted text-muted-foreground w-fit">
                            <X className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                        {testimonial.isFeatured && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700 w-fit">
                            <Star className="w-3 h-3" />
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(testimonial)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          data-testid={`button-edit-${testimonial.id}`}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(testimonial.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          data-testid={`button-delete-${testimonial.id}`}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
    </AdminLayout>
  );
}

export function AdminTestimonials() {
  return (
    <ErrorBoundary>
      <AdminGuard>
        <AdminTestimonialsContent />
      </AdminGuard>
    </ErrorBoundary>
  );
}
