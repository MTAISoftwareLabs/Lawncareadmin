import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Package, MapPin, CheckCircle, Clock, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function OrderTracking() {
  const [orderId, setOrderId] = useState("");
  const [searchOrderId, setSearchOrderId] = useState<number | null>(null);
  const { toast } = useToast();

  const { data, isLoading } = useQuery<{ order: any; tracking: any[] }>({
    queryKey: ["/api/orders", searchOrderId, "tracking"],
    enabled: !!searchOrderId,
  });

  const handleSearch = () => {
    const id = parseInt(orderId);
    if (isNaN(id)) {
      toast({ title: "Please enter a valid order ID", variant: "destructive" });
      return;
    }
    setSearchOrderId(id);
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "processing":
        return <Package className="h-5 w-5 text-blue-600" />;
      case "shipped":
        return <Truck className="h-5 w-5 text-orange-600" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Track Your Order</h1>
          <p className="text-gray-600 mt-2">Enter your order ID to see real-time tracking</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Enter Order ID</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="number"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Order ID (e.g., 12345)"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                data-testid="input-order-id"
              />
              <Button onClick={handleSearch} data-testid="button-track-order">
                <Package className="h-4 w-4 mr-2" />
                Track Order
              </Button>
            </div>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading order details...</p>
          </div>
        )}

        {data?.order && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Order #{data.order.id}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(data.order.status)}
                      <span className="font-semibold capitalize">{data.order.status}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-semibold mt-1">₹{data.order.total}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Shipping Address</p>
                    <p className="mt-1">
                      {data.order.shippingAddress}, {data.order.shippingCity}, {data.order.shippingState} - {data.order.shippingZip}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tracking History</CardTitle>
              </CardHeader>
              <CardContent>
                {data.tracking?.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No tracking updates yet</p>
                ) : (
                  <div className="space-y-4">
                    {data.tracking?.map((track: any, index: number) => (
                      <div key={track.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          {getStatusIcon(track.status)}
                          {index < data.tracking.length - 1 && (
                            <div className="w-0.5 h-12 bg-gray-300 my-1"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold capitalize">{track.status}</p>
                              {track.description && (
                                <p className="text-sm text-gray-600 mt-1">{track.description}</p>
                              )}
                              {track.location && (
                                <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                                  <MapPin className="h-3 w-3" />
                                  {track.location}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">
                                {new Date(track.createdAt).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-400">
                                {new Date(track.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {searchOrderId && !isLoading && !data?.order && (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-gray-600">Order not found. Please check your order ID and try again.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
