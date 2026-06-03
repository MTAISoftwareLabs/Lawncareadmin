import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminLayout } from "@/components/AdminLayout";
import { Package, Calendar, DollarSign } from "lucide-react";

function AdminReturnsContent() {
  const queryClient = useQueryClient();

  const { data: returns, isLoading } = useQuery({
    queryKey: ["admin-returns"],
    queryFn: api.admin.returns.getAll,
  });

  const updateReturnMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.admin.returns.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-returns"] });
      alert("Return request updated successfully!");
    },
    onError: (error: any) => {
      alert(error.message || "Failed to update return request");
    },
  });

  const handleUpdateStatus = (returnId: number, status: string) => {
    if (confirm(`Update return status to "${status}"?`)) {
      updateReturnMutation.mutate({ id: returnId, data: { status } });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm",
      approved: "bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm",
      rejected: "bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm",
    };
    return colors[status] || "bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm";
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
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Return Requests Management</h1>

        <div className="grid gap-4">
          {returns?.map((returnRequest: any) => (
            <Card key={returnRequest.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">Return Request #{returnRequest.id}</h3>
                  <p className="text-sm text-gray-600 mt-1">Order #{returnRequest.orderId}</p>
                </div>
                <span className={getStatusColor(returnRequest.status)} data-testid={`badge-return-status-${returnRequest.id}`}>
                  {returnRequest.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    Requested: {new Date(returnRequest.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">Reason: {returnRequest.reason}</span>
                </div>
              </div>

              {returnRequest.status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleUpdateStatus(returnRequest.id, "approved")}
                    className="bg-green-600 hover:bg-green-700"
                    data-testid={`button-approve-${returnRequest.id}`}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleUpdateStatus(returnRequest.id, "rejected")}
                    data-testid={`button-reject-${returnRequest.id}`}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </Card>
          ))}

          {returns?.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-gray-600">No return requests found</p>
            </Card>
          )}
        </div>
      </div>
    </div>
    </AdminLayout>
  );
}

export function AdminReturns() {
  return (
    <AdminGuard>
      <AdminReturnsContent />
    </AdminGuard>
  );
}
