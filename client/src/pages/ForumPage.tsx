import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  MessageSquare, Heart, Send, Plus, Image, Video, 
  ArrowLeft, Clock, User 
} from "lucide-react";
import type { EmbeddedPageProps } from "@/components/MemberPageWrapper";
import { PageShell, PageContainer } from "@/components/MemberPageWrapper";
import { uploadMediaFile } from "@/lib/uploadMedia";

interface ForumPost {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string | null;
  contentType: string;
  textContent: string | null;
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: string;
}

interface Comment {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string | null;
  content: string;
  createdAt: string;
}

export function ForumPage({ embedded = false }: EmbeddedPageProps = {}) {
  useLocation();
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [newPostContent, setNewPostContent] = useState("");
  const [newComment, setNewComment] = useState("");
  const [postImages, setPostImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { data: posts, isLoading } = useQuery<ForumPost[]>({
    queryKey: ["/api/posts"],
  });

  const { data: comments, isLoading: commentsLoading } = useQuery<Comment[]>({
    queryKey: ["/api/posts", selectedPost?.id, "comments"],
    enabled: !!selectedPost,
  });

  const createPostMutation = useMutation({
    mutationFn: async (payload: { content: string; imageUrls: string[] }) => {
      return apiRequest("/api/posts", {
        method: "POST",
        body: JSON.stringify({
          post_type: payload.imageUrls.length ? "image" : "text",
          content: payload.content,
          image_urls: payload.imageUrls,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setNewPostContent("");
      setPostImages([]);
      setShowCreateForm(false);
      toast({ title: "Success", description: "Post created successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Please login to create posts", variant: "destructive" });
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest(`/api/posts/${postId}/like`, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Please login to like posts", variant: "destructive" });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: number; content: string }) => {
      return apiRequest(`/api/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts", selectedPost?.id, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setNewComment("");
      toast({ title: "Success", description: "Comment added!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Please login to comment", variant: "destructive" });
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (selectedPost) {
    return (
      <PageShell embedded={embedded}>
        {!embedded && <Navbar />}
        <PageContainer embedded={embedded} className="max-w-2xl">
          <Button
            variant="ghost"
            onClick={() => setSelectedPost(null)}
            className="mb-4"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Forum
          </Button>

          <Card>
            <CardHeader className="flex flex-row items-start gap-4">
              <Avatar>
                <AvatarImage src={selectedPost.userAvatar || undefined} />
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{selectedPost.userName}</p>
                <p className="text-sm text-muted-foreground">{formatDate(selectedPost.createdAt)}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedPost.textContent && (
                <p className="text-foreground">{selectedPost.textContent}</p>
              )}
              {selectedPost.mediaUrl && selectedPost.contentType === "image" && (
                <img
                  src={selectedPost.mediaUrl}
                  alt="Post"
                  className="rounded-lg w-full"
                />
              )}
              {selectedPost.mediaUrl && selectedPost.contentType === "video" && (
                <video
                  src={selectedPost.mediaUrl}
                  controls
                  className="rounded-lg w-full"
                  poster={selectedPost.thumbnailUrl || undefined}
                />
              )}

              <div className="flex items-center gap-4 pt-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => likeMutation.mutate(selectedPost.id)}
                  className={selectedPost.isLiked ? "text-red-500" : ""}
                  data-testid="button-like"
                >
                  <Heart className={`w-4 h-4 mr-1 ${selectedPost.isLiked ? "fill-current" : ""}`} />
                  {selectedPost.likesCount}
                </Button>
                <span className="text-muted-foreground text-sm">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  {selectedPost.commentsCount} comments
                </span>
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="font-semibold">Comments</h3>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    data-testid="input-comment"
                  />
                  <Button
                    size="icon"
                    onClick={() => commentMutation.mutate({ postId: selectedPost.id, content: newComment })}
                    disabled={!newComment.trim() || commentMutation.isPending}
                    data-testid="button-send-comment"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                {commentsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : comments && comments.length > 0 ? (
                  <div className="space-y-3">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3" data-testid={`comment-${comment.id}`}>
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={comment.userAvatar || undefined} />
                          <AvatarFallback>
                            <User className="w-3 h-3" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-muted rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{comment.userName}</span>
                            <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No comments yet. Be the first!</p>
                )}
              </div>
            </CardContent>
          </Card>
        </PageContainer>
      </PageShell>
    );
  }

  return (
    <PageShell embedded={embedded}>
      {!embedded && <Navbar />}
      <PageContainer embedded={embedded}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Community Forum</h1>
            <p className="text-muted-foreground mt-1">
              Share your lawn care journey and connect with other enthusiasts
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)} data-testid="button-create-post">
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>

        {showCreateForm && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <Textarea
                placeholder="Share your lawn care tips, questions, or updates..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="min-h-[120px] mb-4"
                data-testid="textarea-new-post"
              />
              {postImages.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {postImages.map((url) => (
                    <img key={url} src={url} alt="" className="h-20 w-20 rounded-lg object-cover" />
                  ))}
                </div>
              )}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadingImage(true);
                  try {
                    const url = await uploadMediaFile(file);
                    setPostImages((prev) => [...prev, url]);
                  } catch {
                    toast({ title: "Upload failed", variant: "destructive" });
                  } finally {
                    setUploadingImage(false);
                    e.target.value = "";
                  }
                }}
              />
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={uploadingImage}
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <Image className="w-4 h-4 mr-1" />
                    {uploadingImage ? "Uploading..." : "Photo"}
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    <Video className="w-4 h-4 mr-1" />
                    Video
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => { setShowCreateForm(false); setPostImages([]); }} data-testid="button-cancel-post">
                    Cancel
                  </Button>
                  <Button
                    onClick={() => createPostMutation.mutate({ content: newPostContent, imageUrls: postImages })}
                    disabled={(!newPostContent.trim() && postImages.length === 0) || createPostMutation.isPending}
                    data-testid="button-submit-post"
                  >
                    {createPostMutation.isPending ? "Posting..." : "Post"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="space-y-4 max-w-2xl mx-auto">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="space-y-4 max-w-2xl mx-auto">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="hover-elevate cursor-pointer transition-all"
                onClick={() => setSelectedPost(post)}
                data-testid={`card-post-${post.id}`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={post.userAvatar || undefined} />
                      <AvatarFallback>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{post.userName}</span>
                        <span className="text-sm text-muted-foreground flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(post.createdAt)}
                        </span>
                      </div>
                      
                      {post.textContent && (
                        <p className="text-foreground line-clamp-3 mb-3">{post.textContent}</p>
                      )}

                      {post.mediaUrl && post.contentType === "image" && (
                        <img
                          src={post.mediaUrl}
                          alt="Post"
                          className="rounded-lg w-full max-h-64 object-cover mb-3"
                        />
                      )}

                      {post.contentType !== "text" && (
                        <Badge variant="secondary" className="mb-3">
                          {post.contentType === "image" ? (
                            <><Image className="w-3 h-3 mr-1" /> Photo</>
                          ) : (
                            <><Video className="w-3 h-3 mr-1" /> Video</>
                          )}
                        </Badge>
                      )}

                      <div className="flex items-center gap-4 pt-2 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            likeMutation.mutate(post.id);
                          }}
                          className={post.isLiked ? "text-red-500" : ""}
                          data-testid={`button-like-${post.id}`}
                        >
                          <Heart className={`w-4 h-4 mr-1 ${post.isLiked ? "fill-current" : ""}`} />
                          {post.likesCount}
                        </Button>
                        <span className="text-muted-foreground text-sm">
                          <MessageSquare className="w-4 h-4 inline mr-1" />
                          {post.commentsCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to share something with the community!
              </p>
              <Button onClick={() => setShowCreateForm(true)} data-testid="button-first-post">
                Create First Post
              </Button>
            </CardContent>
          </Card>
        )}
      </PageContainer>
    </PageShell>
  );
}
