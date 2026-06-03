import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Play, Plus, Pencil, Trash2, Loader2, Lock, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface VideoLesson {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  category: string;
  difficulty: string;
  durationMinutes: number;
  instructor: string;
  isPremium: boolean;
  displayOrder: number;
  isActive: boolean;
}

export function AdminLessons() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<VideoLesson | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    thumbnailUrl: "",
    category: "Basics",
    difficulty: "beginner",
    durationMinutes: 0,
    instructor: "TurfguyRoss",
    isPremium: false,
    displayOrder: 1,
  });

  const { data: lessons = [], isLoading } = useQuery<VideoLesson[]>({
    queryKey: ["/api/admin/lessons"],
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      apiRequest("/api/admin/lessons", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({ title: "Lesson created" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/lessons"] });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number } & typeof formData) =>
      apiRequest(`/api/admin/lessons/${data.id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({ title: "Lesson updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/lessons"] });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/admin/lessons/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Lesson deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/lessons"] });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      videoUrl: "",
      thumbnailUrl: "",
      category: "Basics",
      difficulty: "beginner",
      durationMinutes: 0,
      instructor: "TurfguyRoss",
      isPremium: false,
      displayOrder: 1,
    });
    setEditingLesson(null);
  };

  const handleEdit = (lesson: VideoLesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description || "",
      videoUrl: lesson.videoUrl || "",
      thumbnailUrl: lesson.thumbnailUrl || "",
      category: lesson.category,
      difficulty: lesson.difficulty,
      durationMinutes: lesson.durationMinutes || 0,
      instructor: lesson.instructor,
      isPremium: lesson.isPremium,
      displayOrder: lesson.displayOrder || 1,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingLesson) {
      updateMutation.mutate({ id: editingLesson.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Video Lessons</h1>
            <p className="text-muted-foreground">Manage video content</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-lesson">
                <Plus className="w-4 h-4 mr-2" />
                Add Lesson
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingLesson ? "Edit" : "Add"} Lesson</DialogTitle>
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
                <Input
                  placeholder="Video URL"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                />
                <Input
                  placeholder="Thumbnail URL"
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                />
                <select
                  className="w-full p-2 border rounded-md"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Basics">Basics</option>
                  <option value="Seasonal">Seasonal</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Problem Solving">Problem Solving</option>
                  <option value="Science">Science</option>
                  <option value="Nutrition">Nutrition</option>
                </select>
                <select
                  className="w-full p-2 border rounded-md"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <Input
                  type="number"
                  placeholder="Duration (minutes)"
                  value={formData.durationMinutes || ""}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 0 })}
                />
                <Input
                  placeholder="Instructor"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Display Order"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isPremium}
                    onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                  />
                  <span>Premium Only</span>
                </label>
                <div className="col-span-2">
                  <Button 
                    onClick={handleSubmit} 
                    className="w-full"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {editingLesson ? "Update" : "Create"}
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
            {lessons.map((lesson) => (
              <Card key={lesson.id} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-32 h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      {lesson.thumbnailUrl ? (
                        <img 
                          src={lesson.thumbnailUrl} 
                          alt={lesson.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Play className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{lesson.title}</h3>
                        {lesson.isPremium && (
                          <Badge className="bg-yellow-500">
                            <Lock className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                        {lesson.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <Badge variant="outline">{lesson.category}</Badge>
                        <Badge variant="secondary" className="capitalize">{lesson.difficulty}</Badge>
                        {lesson.durationMinutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {lesson.durationMinutes} min
                          </span>
                        )}
                        <span>By {lesson.instructor}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(lesson)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => deleteMutation.mutate(lesson.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
