import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, Package } from "lucide-react";
import { Link } from "wouter";
import { formatPrice } from "@/lib/utils";

export function ReturnsPage() {
  const { data: returns, isLoading } = useQuery({
    queryKey: ["returns"],
    queryFn: api.returns.getAll,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "processing": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <RotateCcw className="w-6 h-6 text-primary" />
        <h1 className="text-3xl font-bold">Returns & Refunds</h1>
      </div>

      {!returns || returns.length === 0 ? (
        <Card data-testid="empty-returns">
          <CardContent className="py-12 text-center">
            <RotateCcw className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No return requests</h2>
            <p className="text-gray-600 mb-4">
              You haven't requested any returns yet
            </p>
            <Link href="/orders">
              <Button data-testid="button-orders">View Orders</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {returns.map((returnItem: any) => (
            <Card key={returnItem.id} data-testid={`card-return-${returnItem.id}`}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-gray-600" />
                      <span className="font-semibold" data-testid={`text-order-id-${returnItem.id}`}>
                        Order #{returnItem.orderId}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(returnItem.status)}`} data-testid={`text-status-${returnItem.id}`}>
                      {returnItem.status.charAt(0).toUpperCase() + returnItem.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Reason for Return:</p>
                    <p className="text-sm text-gray-600">{returnItem.reason}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div>
                      <p className="text-sm text-gray-600">Refund Amount:</p>
                      <p className="text-lg font-bold text-primary">{formatPrice(parseFloat(returnItem.refundAmount))}</p>
                      <p className="text-xs text-gray-500">
                        Refund Status: <span className="font-medium">{returnItem.refundStatus}</span>
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">
                      Requested on {new Date(returnItem.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
