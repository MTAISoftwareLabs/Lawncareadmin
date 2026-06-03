import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Video, CheckCircle2, XCircle, Trash2, Eye } from "lucide-react";

export default function AdminFeedbackVideos() {
  const { toast } = useToast();
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const { data: videos = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/feedback-videos"],
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, isApproved, isPublished, adminNotes }: any) => {
      return await apiRequest(`/api/admin/feedback-videos/${id}/approve`, "PATCH", {
        isApproved,
        isPublished,
        adminNotes,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Video status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/feedback-videos"] });
      setSelectedVideo(null);
      setAdminNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update video status",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/admin/feedback-videos/${id}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Video Deleted",
        description: "Feedback video has been removed",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/feedback-videos"] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete video",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (video: any, approved: boolean) => {
    approveMutation.mutate({
      id: video.id,
      isApproved: approved,
      isPublished: approved,
      adminNotes,
    });
  };

  const getVideoEmbedUrl = (url: string) => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("youtu.be")
        ? url.split("/").pop()
        : new URLSearchParams(new URL(url).search).get("v");
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const pendingVideos = videos.filter((v) => !v.isApproved);
  const approvedVideos = videos.filter((v) => v.isApproved);

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <Video className="w-8 h-8" />
            Customer Feedback Videos
          </h1>
          <p className="text-muted-foreground mt-1">Review and manage customer video testimonials</p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Loading videos...
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {pendingVideos.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Pending Review ({pendingVideos.length})
                </h2>
                <div className="grid gap-4">
                  {pendingVideos.map((video) => (
                    <Card key={video.id} data-testid={`card-pending-${video.id}`}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {video.videoUrl && (
                            <div className="w-80 h-48 flex-shrink-0">
                              <iframe
                                src={getVideoEmbedUrl(video.videoUrl)}
                                className="w-full h-full rounded"
                                allowFullScreen
                                title={video.title}
                                data-testid={`video-iframe-${video.id}`}
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-bold text-lg mb-2" data-testid={`text-title-pending-${video.id}`}>{video.title}</h3>
                            {video.description && (
                              <p className="text-sm text-muted-foreground mb-3" data-testid={`text-desc-${video.id}`}>{video.description}</p>
                            )}
                            <div className="text-sm space-y-1 mb-4">
                              <p className="text-muted-foreground" data-testid={`text-rating-${video.id}`}>
                                Rating: {video.rating || 5} stars
                              </p>
                              <p className="text-muted-foreground" data-testid={`text-date-${video.id}`}>
                                Submitted: {new Date(video.createdAt).toLocaleDateString()}
                              </p>
                            </div>

                            {selectedVideo?.id === video.id ? (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium mb-2">
                                    Admin Notes (Optional)
                                  </label>
                                  <Textarea
                                    placeholder="Add notes about this video..."
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    data-testid={`input-notes-${video.id}`}
                                    rows={3}
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleApprove(video, true)}
                                    disabled={approveMutation.isPending}
                                    className="bg-green-600 hover:bg-green-700"
                                    data-testid={`button-approve-${video.id}`}
                                  >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Approve & Publish
                                  </Button>
                                  <Button
                                    onClick={() => handleApprove(video, false)}
                                    disabled={approveMutation.isPending}
                                    variant="destructive"
                                    data-testid={`button-reject-${video.id}`}
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      setSelectedVideo(null);
                                      setAdminNotes("");
                                    }}
                                    variant="outline"
                                    data-testid={`button-cancel-${video.id}`}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => {
                                    setSelectedVideo(video);
                                    setAdminNotes(video.adminNotes || "");
                                  }}
                                  data-testid={`button-review-${video.id}`}
                                >
                                  Review Video
                                </Button>
                                <Button
                                  onClick={() => deleteMutation.mutate(video.id)}
                                  variant="outline"
                                  disabled={deleteMutation.isPending}
                                  data-testid={`button-delete-${video.id}`}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {approvedVideos.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4">
                  Approved & Published ({approvedVideos.length})
                </h2>
                <div className="grid gap-4">
                  {approvedVideos.map((video) => (
                    <Card key={video.id} data-testid={`card-approved-${video.id}`}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {video.videoUrl && (
                            <div className="w-64 h-36 flex-shrink-0">
                              <iframe
                                src={getVideoEmbedUrl(video.videoUrl)}
                                className="w-full h-full rounded"
                                allowFullScreen
                                title={video.title}
                                data-testid={`video-iframe-approved-${video.id}`}
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-bold mb-1" data-testid={`text-title-approved-${video.id}`}>{video.title}</h3>
                                {video.description && (
                                  <p className="text-sm text-muted-foreground mb-2" data-testid={`text-desc-approved-${video.id}`}>{video.description}</p>
                                )}
                                <div className="text-sm text-muted-foreground" data-testid={`text-approved-date-${video.id}`}>
                                  Approved: {new Date(video.updatedAt).toLocaleDateString()}
                                </div>
                                {video.adminNotes && (
                                  <div className="mt-2 text-sm" data-testid={`text-notes-${video.id}`}>
                                    <span className="font-medium">Admin Notes:</span> {video.adminNotes}
                                  </div>
                                )}
                              </div>
                              <Button
                                onClick={() => deleteMutation.mutate(video.id)}
                                variant="outline"
                                size="sm"
                                disabled={deleteMutation.isPending}
                                data-testid={`button-delete-approved-${video.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {videos.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p data-testid="text-no-videos-admin">No feedback videos submitted yet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
