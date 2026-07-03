import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Leaf, Play, Clock, Lock, Search, Filter, ChevronRight, User, 
  CheckCircle, BookOpen
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import type { EmbeddedPageProps } from "@/components/MemberPageWrapper";
import { PageShell, PageContainer } from "@/components/MemberPageWrapper";
import { MarketingSiteHeader } from "@/components/MarketingSiteHeader";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { VideoPlayerDialog } from "@/components/media/VideoPlayerDialog";
import { AppImage } from "@/components/media/AppImage";
import { useToast } from "@/hooks/use-toast";

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
}

const categories = ["All", "Basics", "Seasonal", "Maintenance", "Problem Solving", "Science", "Nutrition"];
const difficulties = ["All", "beginner", "intermediate", "advanced"];

export function LessonsPage({ embedded = false }: EmbeddedPageProps = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [playing, setPlaying] = useState<{ url: string; title: string } | null>(null);
  const [loadingLessonId, setLoadingLessonId] = useState<number | null>(null);
  const { toast } = useToast();

  const { user } = useAuth();
  const { isPremium: isPremiumUser } = useSubscription();

  const { data: lessons = [], isLoading } = useQuery<VideoLesson[]>({
    queryKey: ["/api/lessons"],
  });

  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || lesson.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "All" || lesson.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const openLesson = async (lesson: VideoLesson) => {
    if (lesson.isPremium && !isPremiumUser) {
      return;
    }
    setLoadingLessonId(lesson.id);
    try {
      const res = await fetch(`/api/lessons/${lesson.id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load lesson");
      const detail = await res.json();
      if (!detail.videoUrl) {
        toast({
          title: "Premium required",
          description: "Subscribe to watch this lesson.",
          variant: "destructive",
        });
        return;
      }
      setPlaying({ url: detail.videoUrl, title: detail.title || lesson.title });
    } catch {
      toast({
        title: "Could not play video",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setLoadingLessonId(null);
    }
  };

  return (
    <PageShell embedded={embedded}>
      {!embedded && <MarketingSiteHeader user={!!user} />}

      <PageContainer embedded={embedded}>
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Video Lessons</h1>
          <p className="text-muted-foreground">
            Expert tutorials from TurfguyRoss to help you master lawn care.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search lessons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-lessons"
              />
            </div>
          </div>
          
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(category)}
                data-testid={`filter-category-${category.toLowerCase()}`}
              >
                {category}
              </Badge>
            ))}
          </div>
          
          {/* Difficulty Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Difficulty:</span>
            {difficulties.map((diff) => (
              <Badge
                key={diff}
                variant={selectedDifficulty === diff ? "default" : "outline"}
                className="cursor-pointer capitalize"
                onClick={() => setSelectedDifficulty(diff)}
                data-testid={`filter-difficulty-${diff.toLowerCase()}`}
              >
                {diff === "All" ? "All Levels" : diff}
              </Badge>
            ))}
          </div>
        </div>

        {/* Lessons Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-muted" />
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredLessons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map((lesson, index) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className={`overflow-hidden border-border hover-elevate cursor-pointer ${
                    lesson.isPremium && !isPremiumUser ? 'opacity-75' : ''
                  }`}
                  data-testid={`lesson-card-${lesson.id}`}
                  onClick={() => openLesson(lesson)}
                >
                  <div className="relative aspect-video bg-muted">
                    {loadingLessonId === lesson.id && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
                        <Play className="h-10 w-10 animate-pulse text-white" />
                      </div>
                    )}
                    {lesson.thumbnailUrl ? (
                      <AppImage 
                        src={lesson.thumbnailUrl} 
                        alt={lesson.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                        <BookOpen className="w-12 h-12 text-primary/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      {lesson.isPremium && !isPremiumUser ? (
                        <Lock className="w-10 h-10 text-white" />
                      ) : (
                        <Play className="w-10 h-10 text-white" />
                      )}
                    </div>
                    {lesson.isPremium && (
                      <Badge className="absolute top-2 right-2 bg-yellow-500">Premium</Badge>
                    )}
                    <Badge variant="secondary" className="absolute bottom-2 left-2">
                      {lesson.category}
                    </Badge>
                    {lesson.durationMinutes && (
                      <Badge variant="secondary" className="absolute bottom-2 right-2">
                        <Clock className="w-3 h-3 mr-1" />
                        {lesson.durationMinutes} min
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-1">{lesson.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{lesson.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span>{lesson.instructor}</span>
                      </div>
                      <Badge variant="outline" className="capitalize text-xs">
                        {lesson.difficulty}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No lessons found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
            <Button 
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setSelectedDifficulty("All");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Premium CTA */}
        {!isPremiumUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-8 text-center">
                <Lock className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Unlock All Premium Lessons
                </h3>
                <p className="text-muted-foreground max-w-xl mx-auto mb-6">
                  Get access to our complete library of expert tutorials, personalized care plans, and AI-powered diagnosis tools.
                </p>
                <Link href="/signup">
                  <Button size="lg">
                    Start Your Free 7-Day Trial
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </PageContainer>

      <VideoPlayerDialog
        open={!!playing}
        onOpenChange={(open) => !open && setPlaying(null)}
        videoUrl={playing?.url}
        title={playing?.title}
      />
    </PageShell>
  );
}
