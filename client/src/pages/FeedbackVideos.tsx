import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Video, Upload, Star } from "lucide-react";

export default function FeedbackVideosPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    videoUrl: "",
    title: "",
    description: "",
    rating: 5,
  });

  const { data: myVideos = [], isLoading, error } = useQuery<any[]>({
    queryKey: ["/api/feedback-videos/my"],
  });

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/feedback-videos", { method: "POST", body: JSON.stringify(data) });
    },
    onSuccess: () => {
      toast({
        title: "Video Submitted!",
        description: "Your feedback video has been submitted for review.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/feedback-videos/my"] });
      setFormData({ videoUrl: "", title: "", description: "", rating: 5 });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit feedback video",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.videoUrl || !formData.title) {
      toast({
        title: "Missing Information",
        description: "Please provide video URL and title",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.rating < 1 || formData.rating > 5) {
      toast({
        title: "Invalid Rating",
        description: "Rating must be between 1 and 5 stars",
        variant: "destructive",
      });
      return;
    }
    
    submitMutation.mutate(formData);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2 flex items-center gap-2">
            <Video className="w-8 h-8" />
            Share Your Experience
          </h1>
          <p className="text-muted-foreground">Submit a video review and help others discover our lawn care products</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Submit Feedback Video
            </CardTitle>
            <CardDescription>Share your product experience via YouTube, Vimeo, or any video link</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" data-testid="label-video-url">
                  Video URL *
                </label>
                <Input
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  data-testid="input-video-url"
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Paste your YouTube, Vimeo, or other video link
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" data-testid="label-title">
                  Video Title *
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Amazing results with Ashwagandha!"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  data-testid="input-title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" data-testid="label-description">
                  Description (Optional)
                </label>
                <Textarea
                  placeholder="Tell us more about your experience..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  data-testid="input-description"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" data-testid="label-rating">
                  Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="focus:outline-none"
                      data-testid={`button-rating-${star}`}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= formData.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">{formData.rating} stars</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitMutation.isPending}
                className="w-full"
                data-testid="button-submit-video"
              >
                {submitMutation.isPending ? "Submitting..." : "Submit Feedback Video"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-2xl font-bold mb-4">My Submitted Videos</h2>
          {isLoading ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Loading your videos...
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p className="text-destructive">Failed to load videos. Please try again.</p>
              </CardContent>
            </Card>
          ) : myVideos.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p data-testid="text-no-videos">You haven't submitted any feedback videos yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {myVideos.map((video: any) => (
                <Card key={video.id} data-testid={`card-video-${video.id}`}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {video.videoUrl && (
                        <div className="w-64 h-36 flex-shrink-0">
                          <iframe
                            src={getVideoEmbedUrl(video.videoUrl)}
                            className="w-full h-full rounded"
                            allowFullScreen
                            title={video.title}
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold mb-1" data-testid={`text-title-${video.id}`}>
                          {video.title}
                        </h3>
                        {video.description && (
                          <p className="text-sm text-muted-foreground mb-2">{video.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: video.rating || 5 }).map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            video.isApproved
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`} data-testid={`status-${video.id}`}>
                            {video.isApproved ? "Approved" : "Pending Review"}
                          </span>
                          {video.isPublished && (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                              Published
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
