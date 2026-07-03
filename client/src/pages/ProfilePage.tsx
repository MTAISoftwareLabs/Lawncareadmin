import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { useLocation } from "wouter";
import { LogOut, Package, Crown } from "lucide-react";
import type { EmbeddedPageProps } from "@/components/MemberPageWrapper";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export function ProfilePage({ embedded = false }: EmbeddedPageProps = {}) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { user: authUser, isLoading } = useAuth();
  const { isPremium } = useSubscription();
  const [billingLoading, setBillingLoading] = useState(false);

  const { data: legacyUser } = useQuery({
    queryKey: ["user"],
    queryFn: api.auth.me,
    enabled: !embedded,
  });

  const user = embedded ? { user: authUser } : legacyUser;

  const { data: orders } = useQuery({
    queryKey: ["orders"],
    queryFn: api.orders.getAll,
  });

  const logoutMutation = useMutation({
    mutationFn: api.auth.logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      setLocation("/");
    },
  });

  useEffect(() => {
    if (!embedded && user === null) {
      setLocation("/login");
    }
  }, [user, setLocation, embedded]);

  if (!embedded && !user) {
    return null;
  }

  if (embedded && isLoading) {
    return null;
  }

  if (embedded && !authUser) {
    return null;
  }

  const openBillingPortal = async () => {
    setBillingLoading(true);
    try {
      const response = await apiRequest("/api/stripe/create-portal", {
        method: "POST",
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/app/profile`,
        }),
      });
      if (response.url) {
        window.location.href = response.url;
      }
    } catch {
      setLocation("/pricing");
    } finally {
      setBillingLoading(false);
    }
  };

  return (
    <div className={embedded ? "" : "container mx-auto px-4 py-8"}>
      {embedded && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-sm text-muted-foreground">Your account and subscription</p>
        </div>
      )}
      <div className="grid lg:grid-cols-3 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{user?.user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.user?.email}</p>
              </div>
              {user?.user?.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{user.user.phone}</p>
                </div>
              )}
              {embedded && (
                <div>
                  <p className="text-sm text-muted-foreground">Subscription</p>
                  <Badge className="mt-1 capitalize">
                    {(authUser?.subscriptionStatus === "premium" || authUser?.subscriptionStatus === "trial") && (
                      <Crown className="mr-1 h-3 w-3" />
                    )}
                    {authUser?.subscriptionStatus || "free"}
                  </Badge>
                  {authUser?.subscriptionStatus !== "premium" && authUser?.subscriptionStatus !== "trial" && (
                    <Link href="/pricing">
                      <Button variant="outline" size="sm" className="mt-3 w-full">
                        Upgrade membership
                      </Button>
                    </Link>
                  )}
                  {isPremium && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full"
                      onClick={openBillingPortal}
                      disabled={billingLoading}
                    >
                      {billingLoading ? "Opening billing..." : "Manage billing"}
                    </Button>
                  )}
                </div>
              )}
              {!embedded && (
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => logoutMutation.mutate()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {!embedded && (
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              {!orders || orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order: any) => (
                    <div
                      key={order.id}
                      className="border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
                      onClick={() => setLocation(`/orders/${order.id}`)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">Order #{order.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatPrice(order.total)}</p>
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs ${
                              order.status === "delivered"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.shippingAddress}, {order.shippingCity}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        )}

        {embedded && (
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 sm:grid-cols-2">
                <Link href="/app/settings"><Button variant="outline" className="w-full justify-start">Edit profile</Button></Link>
                <Link href="/app/my-content"><Button variant="outline" className="w-full justify-start">My content</Button></Link>
                <Link href="/app/saved"><Button variant="outline" className="w-full justify-start">Saved items</Button></Link>
                <Link href="/app/notifications"><Button variant="outline" className="w-full justify-start">Notifications</Button></Link>
                <Link href="/app/chat"><Button variant="outline" className="w-full justify-start">Messages</Button></Link>
                <Link href="/app/privacy"><Button variant="outline" className="w-full justify-start">Privacy policy</Button></Link>
                <Link href="/app/rules"><Button variant="outline" className="w-full justify-start">Community rules</Button></Link>
                <Link href="/contact"><Button variant="outline" className="w-full justify-start">Contact support</Button></Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Quick links</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 sm:grid-cols-2">
                <Link href="/app/lessons"><Button variant="outline" className="w-full justify-start">Video lessons</Button></Link>
                <Link href="/app/library"><Button variant="outline" className="w-full justify-start">Lawn library</Button></Link>
                <Link href="/pricing"><Button variant="outline" className="w-full justify-start">View plans</Button></Link>
                {isPremium && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={openBillingPortal}
                    disabled={billingLoading}
                  >
                    Manage billing
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
