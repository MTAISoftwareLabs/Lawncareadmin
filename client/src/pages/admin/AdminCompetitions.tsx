import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trophy, Plus, Pencil, Trash2, Loader2, Calendar, Award, Image, Heart, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FileUpload } from "@/components/FileUpload";

interface Competition {
  id: number;
  title: string;
  description: string;
  rules: string;
  prize: string;
  prizeImageUrl: string | null;
  startDate: string;
  endDate: string;
  votingEndsAt: string;
  status: string;
  isActive: boolean;
}

interface CompetitionEntry {
  id: number;
  competitionId: number;
  userId: number;
  title: string;
  description: string;
  imageUrl: string;
  votes: number;
  status: string;
  isWinner: boolean;
  createdAt: string;
  user?: { id: number; name: string; avatar: string | null };
  competition?: { id: number; title: string };
}

export function AdminCompetitions() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState<Competition | null>(null);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    rules: "",
    prize: "",
    prizeImageUrl: "",
    startDate: "",
    endDate: "",
    votingEndsAt: "",
    status: "upcoming",
  });

  const { data: competitions = [], isLoading } = useQuery<Competition[]>({
    queryKey: ["/api/admin/competitions"],
  });

  const entriesQueryKey = selectedCompetitionId 
    ? `/api/admin/entries?competitionId=${selectedCompetitionId}` 
    : "/api/admin/entries";

  const { data: entriesData, isLoading: entriesLoading, error: entriesError } = useQuery<{ entries: CompetitionEntry[] }>({
    queryKey: [entriesQueryKey],
  });

  const entries = entriesData?.entries || [];

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      apiRequest("/api/admin/competitions", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({ title: "Competition created" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/competitions"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error("Create error:", error);
      toast({ title: "Failed to create", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number } & typeof formData) =>
      apiRequest(`/api/admin/competitions/${data.id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({ title: "Competition updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/competitions"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/admin/competitions/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Competition deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/competitions"] });
    },
    onError: (error: any) => {
      console.error("Delete error:", error);
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/admin/entries/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Entry deleted" });
      queryClient.invalidateQueries({ queryKey: [entriesQueryKey] });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete entry", description: error.message, variant: "destructive" });
    },
  });

  const setWinnerMutation = useMutation({
    mutationFn: (entry: { id: number; competitionId: number }) =>
      apiRequest(`/api/admin/entries/${entry.id}/set-winner`, { 
        method: "POST"
      }),
    onSuccess: () => {
      toast({ title: "Winner set successfully" });
      queryClient.invalidateQueries({ queryKey: [entriesQueryKey] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/competitions"] });
    },
    onError: (error: any) => {
      toast({ title: "Failed to set winner", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      rules: "",
      prize: "",
      prizeImageUrl: "",
      startDate: "",
      endDate: "",
      votingEndsAt: "",
      status: "upcoming",
    });
    setEditingCompetition(null);
  };

  const handleEdit = (competition: Competition) => {
    setEditingCompetition(competition);
    setFormData({
      title: competition.title,
      description: competition.description || "",
      rules: competition.rules || "",
      prize: competition.prize || "",
      prizeImageUrl: competition.prizeImageUrl || "",
      startDate: competition.startDate?.split('T')[0] || "",
      endDate: competition.endDate?.split('T')[0] || "",
      votingEndsAt: competition.votingEndsAt?.split('T')[0] || "",
      status: competition.status,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingCompetition) {
      updateMutation.mutate({ id: editingCompetition.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const statusColors: Record<string, string> = {
    upcoming: "bg-blue-500",
    active: "bg-green-500",
    voting: "bg-yellow-500",
    completed: "bg-gray-500",
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Competitions</h1>
            <p className="text-muted-foreground">Manage lawn of the month contests</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-competition">
                <Plus className="w-4 h-4 mr-2" />
                Add Competition
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCompetition ? "Edit" : "Add"} Competition</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Input
                    placeholder="Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Textarea
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Textarea
                    placeholder="Rules"
                    value={formData.rules}
                    onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                  />
                </div>
                <Input
                  placeholder="Prize (e.g., $50 Home Depot Gift Card)"
                  value={formData.prize}
                  onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
                />
                <select
                  className="w-full p-2 border rounded-md"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="voting">Voting</option>
                  <option value="completed">Completed</option>
                </select>
                <div>
                  <label className="text-sm text-muted-foreground">Start Date</label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">End Date</label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-muted-foreground">Voting Ends</label>
                  <Input
                    type="date"
                    value={formData.votingEndsAt}
                    onChange={(e) => setFormData({ ...formData, votingEndsAt: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Monthly Prize Image
                  </label>
                  <FileUpload
                    value={formData.prizeImageUrl}
                    onChange={(url) => setFormData({ ...formData, prizeImageUrl: url })}
                    accept="image/*"
                    uploadType="image"
                    placeholder="Upload prize image (e.g., gift card, product photo)"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This image will be shown in the app to display the monthly prize
                  </p>
                </div>
                <div className="col-span-2">
                  <Button 
                    onClick={handleSubmit} 
                    className="w-full"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {editingCompetition ? "Update" : "Create"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {competitions.map((competition) => (
              <Card key={competition.id} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{competition.title}</h3>
                        <Badge className={statusColors[competition.status] || 'bg-gray-500'}>
                          {competition.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                        {competition.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(competition.startDate)} - {formatDate(competition.endDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          {competition.prize}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(competition)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => deleteMutation.mutate(competition.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {competitions.length === 0 && (
              <Card className="border-border">
                <CardContent className="p-12 text-center">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No competitions yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Competition Entries Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5" />
                Competition Entries
              </h2>
              <p className="text-muted-foreground text-sm">View and manage user submissions</p>
            </div>
            <select
              className="p-2 border rounded-md"
              value={selectedCompetitionId || ""}
              onChange={(e) => setSelectedCompetitionId(e.target.value ? parseInt(e.target.value) : null)}
              data-testid="select-competition-filter"
            >
              <option value="">All Competitions</option>
              {competitions.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          {entriesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : entriesError ? (
            <Card className="border-border">
              <CardContent className="p-12 text-center">
                <p className="text-destructive">Failed to load entries</p>
              </CardContent>
            </Card>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {entries.map((entry) => (
              <Card key={entry.id} className="border-border overflow-hidden">
                <div className="aspect-video relative">
                  <img
                    src={entry.imageUrl}
                    alt={entry.title}
                    className="w-full h-full object-cover"
                  />
                  {entry.isWinner && (
                    <Badge className="absolute top-2 left-2 bg-yellow-500">
                      <Trophy className="w-3 h-3 mr-1" />
                      Winner
                    </Badge>
                  )}
                  <Badge className="absolute top-2 right-2 bg-pink-500">
                    <Heart className="w-3 h-3 mr-1" />
                    {entry.votes} votes
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-1">{entry.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{entry.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span>By: {entry.user?.name || "Unknown"}</span>
                    <span>{entry.competition?.title}</span>
                  </div>
                  <div className="flex gap-2">
                    {!entry.isWinner && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setWinnerMutation.mutate({ id: entry.id, competitionId: entry.competitionId })}
                        disabled={setWinnerMutation.isPending}
                        data-testid={`button-set-winner-${entry.id}`}
                      >
                        <Award className="w-4 h-4 mr-1" />
                        Set Winner
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteEntryMutation.mutate(entry.id)}
                      disabled={deleteEntryMutation.isPending}
                      data-testid={`button-delete-entry-${entry.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {entries.length === 0 && (
              <Card className="col-span-full border-border">
                <CardContent className="p-12 text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No entries yet</p>
                </CardContent>
              </Card>
            )}
          </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
