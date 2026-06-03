import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ChevronRight, MapPin, Clock } from "lucide-react";
import { Link } from "wouter";
import { formatPrice } from "@/lib/utils";

export function OrdersPage() {
  const [expandedOrders, setExpandedOrders] = useState<Record<number, boolean>>({});
  
  const { data: orders, isLoading } = useQuery<any[]>({
    queryKey: ["/api/orders"],
  });

  const toggleOrderDetails = (orderId: number) => {
    setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "shipped": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
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
        <Package className="w-6 h-6 text-primary" />
        <h1 className="text-3xl font-bold">My Orders</h1>
      </div>

      {!orders || orders.length === 0 ? (
        <Card data-testid="empty-orders">
          <CardContent className="py-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-4">
              Start shopping to see your orders here
            </p>
            <Link href="/products">
              <Button data-testid="button-shop">Start Shopping</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <OrderCard 
              key={order.id} 
              order={order} 
              isExpanded={expandedOrders[order.id] || false}
              onToggle={() => toggleOrderDetails(order.id)}
              getStatusColor={getStatusColor}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, isExpanded, onToggle, getStatusColor }: any) {
  const { data: trackingData, isLoading: trackingLoading, error: trackingError } = useQuery<{ order: any; tracking: any[] }>({
    queryKey: ["/api/orders", order.id, "tracking"],
    enabled: isExpanded,
  });

  const latestTracking = trackingData?.tracking?.[0];

  return (
    <Card data-testid={`card-order-${order.id}`}>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold" data-testid={`text-order-id-${order.id}`}>
                  Order #{order.id}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(order.status)}`} data-testid={`text-status-${order.id}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <p className="text-sm text-gray-600" data-testid={`text-date-${order.id}`}>
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <p className="text-lg font-bold text-primary mt-2" data-testid={`text-total-${order.id}`}>
                Total: {formatPrice(parseFloat(order.total))}
              </p>
              
              {latestTracking && (
                <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-100">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 text-sm">
                      <p className="font-medium text-blue-900">{latestTracking.status}</p>
                      {latestTracking.location && (
                        <p className="text-blue-700">{latestTracking.location}</p>
                      )}
                      {latestTracking.description && (
                        <p className="text-blue-600 mt-1">{latestTracking.description}</p>
                      )}
                      <p className="text-blue-500 text-xs mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(latestTracking.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Link href={`/orders/${order.id}`}>
                <Button variant="outline" data-testid={`button-view-${order.id}`}>
                  View Details <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              {(order.status === "processing" || order.status === "shipped") && (
                <Button 
                  variant={isExpanded ? "secondary" : "default"}
                  onClick={onToggle}
                  data-testid={`button-track-${order.id}`}
                >
                  {isExpanded ? "Hide" : "Track Order"}
                </Button>
              )}
            </div>
          </div>

          {isExpanded && (
            <div className="border-t pt-4 mt-2">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Order Tracking History
              </h3>
              {trackingLoading ? (
                <div className="text-center py-4 text-muted-foreground">
                  Loading tracking information...
                </div>
              ) : trackingError ? (
                <div className="text-center py-4 text-destructive">
                  Failed to load tracking information
                </div>
              ) : trackingData?.tracking && trackingData.tracking.length > 0 ? (
              <div className="space-y-3">
                {trackingData.tracking.map((track: any, index: number) => (
                  <div 
                    key={track.id} 
                    className={`pl-4 border-l-2 pb-3 ${
                      index === 0 ? "border-primary" : "border-gray-200"
                    }`}
                    data-testid={`tracking-item-${track.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-3 h-3 rounded-full -ml-[1.4rem] mt-1 ${
                        index === 0 ? "bg-primary ring-4 ring-primary/20" : "bg-gray-300"
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-medium ${
                            index === 0 ? "text-primary" : "text-gray-700"
                          }`}>
                            {track.status}
                          </span>
                          {index === 0 && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                              Latest
                            </span>
                          )}
                        </div>
                        {track.location && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {track.location}
                          </p>
                        )}
                        {track.description && (
                          <p className="text-sm text-gray-600 mt-1">{track.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(track.createdAt).toLocaleString()}
                        </p>
                        {track.updatedBy && (
                          <p className="text-xs text-gray-400 mt-0.5">by {track.updatedBy}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No tracking information available yet
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
