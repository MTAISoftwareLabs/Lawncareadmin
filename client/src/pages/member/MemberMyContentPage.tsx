import { useQuery } from "@tanstack/react-query";
import { MemberLayout } from "@/components/MemberLayout";
import { MemberGuard } from "@/components/MemberGuard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, Trophy } from "lucide-react";

interface MyContentResponse {
  status: boolean;
  data: {
    forumPosts: Array<{
      id: number;
      content: string | null;
      imageUrls: string | null;
      mediaUrl: string | null;
      likesCount: number;
      commentsCount: number;
      createdAt: string;
    }>;
    contestEntries: Array<{
      id: number;
      imageUrl: string;
      title?: string | null;
      description?: string | null;
      votes?: number;
      status?: string;
      createdAt: string;
      competitionTitle?: string;
    }>;
  };
}

function parseImageUrls(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function MyContentInner() {
  const { data, isLoading } = useQuery<MyContentResponse>({
    queryKey: ["/api/user/my-content"],
    queryFn: async () => {
      const response = await fetch("/api/user/my-content", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to load content");
      return response.json();
    },
  });

  const posts = data?.data?.forumPosts ?? [];
  const entries = data?.data?.contestEntries ?? [];

  return (
    <MemberLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">My content</h1>
          <p className="text-sm text-muted-foreground">Forum posts and contest entries you have shared</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        ) : (
          <>
            <section>
              <div className="mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <h2 className="text-lg font-semibold">Forum posts ({posts.length})</h2>
              </div>
              {posts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No forum posts yet.</p>
              ) : (
                <div className="space-y-3">
                  {posts.map((post) => {
                    const images = parseImageUrls(post.imageUrls);
                    return (
                      <Card key={post.id}>
                        <CardContent className="p-4">
                          <p className="whitespace-pre-wrap">{post.content}</p>
                          {images.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {images.map((url) => (
                                <img key={url} src={url} alt="" className="h-24 rounded-lg object-cover" />
                              ))}
                            </div>
                          )}
                          {post.mediaUrl && (
                            <img src={post.mediaUrl} alt="" className="mt-3 max-h-48 rounded-lg object-cover" />
                          )}
                          <div className="mt-3 flex gap-3 text-xs text-muted-foreground">
                            <span>{post.likesCount} likes</span>
                            <span>{post.commentsCount} comments</span>
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>

            <section>
              <div className="mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-600" />
                <h2 className="text-lg font-semibold">Contest entries ({entries.length})</h2>
              </div>
              {entries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No contest entries yet.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {entries.map((entry) => (
                    <Card key={entry.id} className="overflow-hidden">
                      <img src={entry.imageUrl} alt={entry.title || entry.description || "Contest entry"} className="h-40 w-full object-cover" />
                      <CardContent className="p-4">
                        {entry.competitionTitle && (
                          <Badge variant="outline" className="mb-2">
                            {entry.competitionTitle}
                          </Badge>
                        )}
                        {(entry.title || entry.description) && (
                          <p className="text-sm">{entry.title || entry.description}</p>
                        )}
                        <p className="mt-2 text-xs text-muted-foreground">
                          {entry.votes ?? 0} votes · {new Date(entry.createdAt).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </MemberLayout>
  );
}

export function MemberMyContentPage() {
  return (
    <MemberGuard>
      <MyContentInner />
    </MemberGuard>
  );
}
