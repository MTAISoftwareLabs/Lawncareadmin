import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Trash2, Eye, EyeOff, Loader2, Pin, ThumbsUp, MessageCircle } from "lucide-react";

export function AdminForum() {
  const { toast } = useToast();

  const { data: posts, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/forum-posts"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => apiRequest(`/api/admin/forum-posts/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/forum-posts"] });
      toast({ title: "Success", description: "Post updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiRequest(`/api/admin/forum-posts/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/forum-posts"] });
      toast({ title: "Success", description: "Post deleted" });
    },
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Forum Moderation</h1>
          <p className="text-muted-foreground">Manage community posts and discussions</p>
        </div>

        <div className="grid gap-4">
          {posts && posts.length > 0 ? (
            posts.map((item: any) => (
              <Card key={item.post.id} className={!item.post.isApproved ? "border-yellow-500" : ""} data-testid={`post-${item.post.id}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">{item.author?.name || "Unknown"}</span>
                        <span className="text-sm text-muted-foreground">{item.author?.email}</span>
                        {item.post.isPinned && <Pin className="w-4 h-4 text-blue-500" />}
                        {!item.post.isApproved && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Pending</span>}
                      </div>
                      <p className="text-sm mb-2">{item.post.content.substring(0, 200)}{item.post.content.length > 200 ? "..." : ""}</p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {item.post.likesCount}</span>
                        <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {item.post.commentsCount}</span>
                        <span>{new Date(item.post.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={item.post.isApproved ? "outline" : "default"}
                        size="sm"
                        onClick={() => updateMutation.mutate({ id: item.post.id, data: { isApproved: !item.post.isApproved } })}
                        data-testid={`button-approve-${item.post.id}`}
                      >
                        {item.post.isApproved ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant={item.post.isPinned ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateMutation.mutate({ id: item.post.id, data: { isPinned: !item.post.isPinned } })}
                        data-testid={`button-pin-${item.post.id}`}
                      >
                        <Pin className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm("Delete this post and all its comments?")) {
                            deleteMutation.mutate(item.post.id);
                          }
                        }}
                        data-testid={`button-delete-${item.post.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No forum posts yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
