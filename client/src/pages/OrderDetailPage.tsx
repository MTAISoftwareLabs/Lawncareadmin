import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api, queryClient } from "@/lib/api";
import { ArrowLeft, Package, MapPin, CreditCard, RotateCcw, CheckCircle2, Clock, Truck, Home, RefreshCw, Download } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";

type Order = {
  id: number;
  userId: number;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  shippingCountry: string;
  createdAt: string;
};

export default function OrderDetailPage() {
  const [, params] = useRoute("/orders/:id");
  const orderId = params?.id ? parseInt(params.id) : 0;
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [error, setError] = useState("");

  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ["/api/orders", orderId],
    queryFn: () => api.orders.getById(orderId),
    enabled: !!orderId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      if (data.status === "delivered" || data.status === "cancelled") return false;
      return 30000;
    },
  });

  const createReturnMutation = useMutation({
    mutationFn: async (data: { orderId: number; reason: string }) => {
      return api.returns.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders", orderId] });
      queryClient.invalidateQueries({ queryKey: ["/api/returns"] });
      setShowReturnForm(false);
      setReturnReason("");
      setError("");
      alert("Return request submitted successfully!");
    },
    onError: (err: Error) => {
      setError(err.message || "Failed to submit return request");
    },
  });

  const handleSubmitReturn = () => {
    if (!returnReason.trim()) {
      setError("Please provide a reason for return");
      return;
    }
    setError("");
    createReturnMutation.mutate({ orderId, reason: returnReason });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <Link href="/orders">
          <Button data-testid="button-back-orders">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium",
      confirmed: "bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium",
      shipped: "bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium",
      delivered: "bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium",
      cancelled: "bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium",
    };
    return colors[status] || "bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium";
  };

  const canRequestReturn = order.status === "delivered";

  const trackingSteps = [
    { key: "pending", label: "Order Placed", icon: Clock, description: "Your order has been placed successfully" },
    { key: "processing", label: "Processing", icon: CheckCircle2, description: "Order confirmed and being prepared" },
    { key: "shipped", label: "Shipped", icon: Truck, description: "Order is on the way" },
    { key: "delivered", label: "Delivered", icon: Home, description: "Order has been delivered" },
  ];

  const statusOrder = ["pending", "processing", "shipped", "delivered"];
  const normalizedStatus = order.status === "confirmed" ? "processing" : order.status;
  const currentStatusIndex = statusOrder.indexOf(normalizedStatus);
  
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    if (order) {
      setLastUpdate(new Date());
    }
  }, [order?.status]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/orders">
          <Button variant="ghost" data-testid="button-back-orders">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl" data-testid="text-order-id">Order #{order.id}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(`/api/orders/${order.id}/invoice`, '_blank')}
                  data-testid="button-download-invoice"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Invoice
                </Button>
                <span className={getStatusColor(order.status)} data-testid={`badge-status-${order.status}`}>
                  {order.status}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold">Order Items</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between py-2">
                  <span>Total Amount</span>
                  <span className="font-semibold" data-testid="text-total-amount">₹{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <hr className="border-gray-200" />

            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold">Shipping Address</h3>
              </div>
              <div className="text-sm space-y-1" data-testid="text-shipping-address">
                <p>{order.shippingAddress}</p>
                <p>{order.shippingCity}, {order.shippingState} {order.shippingZip}</p>
                <p>{order.shippingCountry}</p>
              </div>
            </div>

            <hr className="border-gray-200" />

            <div>
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold">Payment Information</h3>
              </div>
              <div className="text-sm">
                <p>Payment Method: <span className="capitalize" data-testid="text-payment-method">{order.paymentMethod}</span></p>
                <p>Payment Status: <span className="capitalize" data-testid="text-payment-status">{order.paymentStatus}</span></p>
              </div>
            </div>

            {canRequestReturn && (
              <>
                <hr className="border-gray-200" />
                <div>
                  {!showReturnForm ? (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      data-testid="button-request-return"
                      onClick={() => setShowReturnForm(true)}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Request Return
                    </Button>
                  ) : (
                    <div className="space-y-4 p-4 border rounded-lg">
                      <div>
                        <label htmlFor="reason" className="block text-sm font-medium mb-2">
                          Reason for Return
                        </label>
                        <textarea
                          id="reason"
                          className="w-full p-2 border rounded-md min-h-[100px]"
                          placeholder="e.g., Product damaged, Wrong item received, etc."
                          value={returnReason}
                          onChange={(e) => setReturnReason(e.target.value)}
                          data-testid="input-return-reason"
                        />
                      </div>
                      {error && (
                        <div className="text-sm text-red-600">{error}</div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowReturnForm(false);
                            setReturnReason("");
                            setError("");
                          }}
                          data-testid="button-cancel-return"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSubmitReturn}
                          disabled={createReturnMutation.isPending}
                          data-testid="button-submit-return"
                        >
                          {createReturnMutation.isPending ? "Submitting..." : "Submit Return"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {order.status !== "cancelled" && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Order Tracking</CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <RefreshCw className="w-4 h-4 animate-spin-slow" />
                  <span>Auto-updating every 30s</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
            </CardHeader>
            <CardContent>
              <div className="relative" data-testid="timeline-order-tracking">
                {trackingSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  const isLast = index === trackingSteps.length - 1;

                  return (
                    <div key={step.key} className="relative pb-8 last:pb-0" data-testid={`tracking-step-${step.key}`}>
                      {!isLast && (
                        <div 
                          className={`absolute left-4 top-8 w-0.5 h-full ${
                            isCompleted ? 'bg-green-600' : 'bg-gray-300'
                          }`}
                        />
                      )}
                      <div className="relative flex items-start gap-4">
                        <div 
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                            isCompleted 
                              ? 'bg-green-600 border-green-600' 
                              : 'bg-white border-gray-300'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isCompleted ? 'text-white' : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1 pt-0.5">
                          <p className={`font-semibold ${isCurrent ? 'text-green-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                            {step.label}
                          </p>
                          <p className={`text-sm mt-1 ${isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                            {step.description}
                          </p>
                          {isCurrent && (
                            <div className="mt-2">
                              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                Current Status
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
