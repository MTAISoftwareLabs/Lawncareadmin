import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Trophy, Camera, ThumbsUp, Users, Award, Calendar,
  ChevronRight, Upload, Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import type { EmbeddedPageProps } from "@/components/MemberPageWrapper";
import { PageShell, PageContainer } from "@/components/MemberPageWrapper";
import { MarketingSiteHeader } from "@/components/MarketingSiteHeader";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Competition {
  id: number;
  title: string;
  description: string;
  rules: string;
  prize: string;
  startDate: string;
  endDate: string;
  votingEndsAt: string;
  status: string;
}

interface CompetitionEntry {
  id: number;
  competitionId: number;
  userId: number;
  imageUrl: string;
  description: string;
  votes: number;
  voteCount: number;
  hasVoted: boolean;
  user: {
    name: string;
    location?: string | null;
  } | null;
}

interface Winner {
  id: number;
  competitionTitle: string;
  userName: string;
  imageUrl: string;
}

function parseEntriesResponse(json: unknown): CompetitionEntry[] {
  if (Array.isArray(json)) return json as CompetitionEntry[];
  if (json && typeof json === "object") {
    const payload = json as { data?: CompetitionEntry[]; entries?: CompetitionEntry[] };
    return payload.data ?? payload.entries ?? [];
  }
  return [];
}

function parseWinnersResponse(json: unknown): Winner[] {
  if (Array.isArray(json)) return json as Winner[];
  if (json && typeof json === "object") {
    const payload = json as { winners?: Winner[]; data?: Winner[] };
    return payload.winners ?? payload.data ?? [];
  }
  return [];
}

export function CompetitionsPage({ embedded = false }: EmbeddedPageProps = {}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const client = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: activeCompetition } = useQuery<Competition | null>({
    queryKey: ["/api/competitions/active"],
  });

  const entriesQueryKey = ["/api/competitions", activeCompetition?.id, "entries"] as const;

  const { data: entries = [] } = useQuery<CompetitionEntry[]>({
    queryKey: entriesQueryKey,
    enabled: !!activeCompetition?.id,
    queryFn: async () => {
      const response = await fetch(`/api/competitions/${activeCompetition!.id}/entries`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to load entries");
      const json = await response.json();
      return parseEntriesResponse(json);
    },
  });

  const { data: pastWinners = [] } = useQuery<Winner[]>({
    queryKey: ["/api/competitions/winners"],
    queryFn: async () => {
      const response = await fetch("/api/competitions/winners", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to load winners");
      const json = await response.json();
      return parseWinnersResponse(json);
    },
  });

  const voteMutation = useMutation({
    mutationFn: async (entryId: number) => {
      return apiRequest(`/api/competitions/entries/${entryId}/vote`, { method: "POST" });
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: entriesQueryKey });
    },
    onError: (error: Error) => {
      toast({ title: "Vote failed", description: error.message, variant: "destructive" });
    },
  });

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const getDaysRemaining = (endDate: string) => {
    const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const resetSubmitForm = () => {
    setCaption("");
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/upload/media", {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(json.error || "Failed to upload image");
    }
    return json.data?.url as string;
  };

  const handleSubmitEntry = async () => {
    if (!selectedFile) {
      toast({ title: "Photo required", description: "Please choose a lawn photo to upload.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const imageUrl = await uploadImage(selectedFile);
      await apiRequest("/api/competitions/active/entries", {
        method: "POST",
        body: JSON.stringify({
          title: caption || "My lawn",
          description: caption,
          imageUrl,
        }),
      });

      toast({ title: "Entry submitted", description: "Your lawn is in the running. Good luck!" });
      setSubmitOpen(false);
      resetSubmitForm();
      client.invalidateQueries({ queryKey: entriesQueryKey });
      queryClient.invalidateQueries({ queryKey: ["/api/competitions/active"] });
    } catch (error) {
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <PageShell embedded={embedded}>
      {!embedded && <MarketingSiteHeader user={!!user} />}

      <PageContainer embedded={embedded}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-yellow-500" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Lawn of the Month</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Show off your hard work! Submit photos of your lawn to compete for bragging rights and prizes.
          </p>
        </motion.div>

        {activeCompetition && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <Card className="border-yellow-500/30 bg-gradient-to-r from-yellow-500/5 to-transparent">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <Badge className="bg-yellow-500 mb-2">Active Competition</Badge>
                    <CardTitle className="text-2xl">{activeCompetition.title}</CardTitle>
                    <CardDescription className="mt-2">{activeCompetition.description}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-foreground">
                      {getDaysRemaining(activeCompetition.endDate)}
                    </div>
                    <div className="text-sm text-muted-foreground">days remaining</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <div>
                      <div className="text-sm text-muted-foreground">Prize</div>
                      <div className="font-medium text-foreground">{activeCompetition.prize}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">Ends</div>
                      <div className="font-medium text-foreground">{formatDate(activeCompetition.endDate)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
                    <Users className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="text-sm text-muted-foreground">Entries</div>
                      <div className="font-medium text-foreground">{entries.length}</div>
                    </div>
                  </div>
                </div>

                {user ? (
                  <Button className="w-full sm:w-auto" onClick={() => setSubmitOpen(true)}>
                    <Upload className="w-4 h-4 mr-2" />
                    Submit your lawn
                  </Button>
                ) : (
                  <Link href="/signup?next=/app/competitions">
                    <Button className="w-full sm:w-auto">
                      Join to compete
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </motion.section>
        )}

        {entries.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-6">Current entries</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {entries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden border-border hover-elevate">
                    <div className="aspect-video relative">
                      {entry.imageUrl ? (
                        <img
                          src={entry.imageUrl}
                          alt={`${entry.user?.name}'s lawn`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Camera className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                      )}
                      <Badge className="absolute top-2 right-2 bg-background/80 backdrop-blur text-foreground">
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        {entry.voteCount ?? entry.votes ?? 0}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="font-medium text-foreground">{entry.user?.name || "Anonymous"}</div>
                        </div>
                        {user && entry.userId !== user.id && (
                          <Button
                            variant={entry.hasVoted ? "default" : "outline"}
                            size="sm"
                            disabled={voteMutation.isPending}
                            onClick={() => voteMutation.mutate(entry.id)}
                          >
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            {entry.hasVoted ? "Voted" : "Vote"}
                          </Button>
                        )}
                      </div>
                      {entry.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{entry.description}</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {!activeCompetition && (
          <Card className="border-border">
            <CardContent className="p-12 text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No active competition</h3>
              <p className="text-muted-foreground mb-4">
                Check back soon for the next Lawn of the Month competition!
              </p>
              <Link href="/signup">
                <Button variant="outline">Get notified</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {pastWinners.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold text-foreground mb-6">Past winners</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {pastWinners.map((winner) => (
                <Card key={`${winner.id}-${winner.competitionTitle}`} className="overflow-hidden border-border">
                  <div className="aspect-video relative">
                    <img
                      src={winner.imageUrl || "/placeholder.png"}
                      alt={`${winner.userName}'s winning lawn`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-yellow-500">
                        <Trophy className="w-3 h-3 mr-1" />
                        Winner
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="font-medium text-foreground">{winner.userName}</div>
                    <div className="text-sm text-muted-foreground">{winner.competitionTitle}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </PageContainer>

      <Dialog open={submitOpen} onOpenChange={(open) => { setSubmitOpen(open); if (!open) resetSubmitForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit your lawn</DialogTitle>
            <DialogDescription>
              Upload a clear photo of your lawn. One entry per member per competition.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
            />
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full aspect-video rounded-lg object-cover" />
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full aspect-video flex-col items-center justify-center rounded-lg border border-dashed"
              >
                <Camera className="mb-2 h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Choose a photo</span>
              </button>
            )}
            <Textarea
              placeholder="Caption (optional)"
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
            />
            {selectedFile && (
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                Change photo
              </Button>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitOpen(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEntry} disabled={isUploading || !selectedFile}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit entry"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
