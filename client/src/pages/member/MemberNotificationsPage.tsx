import { Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MemberLayout } from "@/components/MemberLayout";
import { MemberGuard } from "@/components/MemberGuard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { Bell, Loader2 } from "lucide-react";

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type?: string | null;
  imageUrl?: string | null;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

function NotificationsContent() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ data: NotificationItem[] }>({
    queryKey: ["/api/notifications", "all"],
    queryFn: async () => {
      const response = await fetch("/api/notifications?all=true", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to load notifications");
      return response.json();
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/notifications/${id}/read`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const notifications = data?.data ?? [];

  return (
    <MemberLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">Push announcements and account updates</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <Bell className="h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">No notifications yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card key={notification.id} className={notification.isRead ? "opacity-80" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="font-semibold">{notification.title}</h3>
                        {!notification.isRead && <Badge>New</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                      {notification.link && (
                        <a
                          href={notification.link}
                          className="mt-2 inline-block text-sm font-medium text-green-700 hover:underline"
                        >
                          Open link
                        </a>
                      )}
                    </div>
                    {!notification.isRead && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markReadMutation.mutate(notification.id)}
                      >
                        Mark read
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MemberLayout>
  );
}

export function MemberNotificationsPage() {
  return (
    <MemberGuard>
      <NotificationsContent />
    </MemberGuard>
  );
}
