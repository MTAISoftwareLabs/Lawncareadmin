import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Leaf, MessageCircle, Send, User, Clock, CheckCircle, Search,
  Loader2, ChevronRight, HelpCircle, Lock
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Question {
  id: number;
  userId: number;
  question: string;
  answer: string;
  status: string;
  category: string;
  createdAt: string;
  answeredAt: string;
  answeredBy: string;
  user: {
    name: string;
  };
}

const categories = ["General", "Fertilization", "Watering", "Mowing", "Weeds", "Disease", "Seeding"];

export function ExpertQAPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [question, setQuestion] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("General");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const { data: questions = [], isLoading: questionsLoading } = useQuery<Question[]>({
    queryKey: ["/api/expert-questions"],
  });

  const { data: myQuestions = [] } = useQuery<Question[]>({
    queryKey: ["/api/expert-questions/my"],
    enabled: !!user,
  });

  const submitMutation = useMutation({
    mutationFn: async (data: { question: string; category: string }) => {
      return apiRequest("/api/expert-questions", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Question submitted!",
        description: "Our experts will respond soon.",
      });
      setQuestion("");
      queryClient.invalidateQueries({ queryKey: ["/api/expert-questions"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit question. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!question.trim()) {
      toast({
        title: "Question required",
        description: "Please enter your question.",
        variant: "destructive",
      });
      return;
    }
    submitMutation.mutate({ question, category: selectedCategory });
  };

  const answeredQuestions = questions.filter(q => q.status === 'answered');
  const filteredQuestions = answeredQuestions.filter(q => 
    q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.answer?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isPremiumUser = user?.subscriptionStatus === 'premium' || user?.subscriptionStatus === 'trial';

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">Lawncare Workshop</span>
            </Link>
            
            <div className="flex items-center gap-3">
              {user ? (
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost">Log In</Button>
                  </Link>
                  <Link href="/signup">
                    <Button>Start Free Trial</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Expert Q&A</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get answers to your lawn care questions from TurfguyRoss and our team of experts.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ask a Question */}
          <div className="lg:col-span-2 space-y-8">
            {/* Question Form */}
            {user && isPremiumUser ? (
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-primary" />
                    Ask a Question
                  </CardTitle>
                  <CardDescription>
                    Our experts typically respond within 24-48 hours
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Category
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <Badge
                          key={cat}
                          variant={selectedCategory === cat ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => setSelectedCategory(cat)}
                        >
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Your Question
                    </label>
                    <Textarea
                      placeholder="What's your lawn care question?"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      rows={4}
                      data-testid="input-expert-question"
                    />
                  </div>
                  <Button 
                    className="w-full"
                    onClick={handleSubmit}
                    disabled={submitMutation.isPending}
                    data-testid="button-submit-question"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Question
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : user ? (
              <Card className="border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5">
                <CardContent className="p-8 text-center">
                  <Lock className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Premium Feature
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Upgrade to Premium to ask questions directly to our lawn care experts.
                  </p>
                  <Link href="/profile">
                    <Button>
                      Upgrade to Premium
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border">
                <CardContent className="p-8 text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Sign In to Ask Questions
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Premium members can submit questions directly to our experts.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/login">
                      <Button variant="outline">Log In</Button>
                    </Link>
                    <Link href="/signup">
                      <Button>Start Free Trial</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* My Questions */}
            {user && myQuestions.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">My Questions</h2>
                <div className="space-y-4">
                  {myQuestions.map((q) => (
                    <Card key={q.id} className="border-border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <Badge variant={q.status === 'answered' ? 'default' : 'secondary'}>
                            {q.status === 'answered' ? (
                              <><CheckCircle className="w-3 h-3 mr-1" /> Answered</>
                            ) : (
                              <><Clock className="w-3 h-3 mr-1" /> Pending</>
                            )}
                          </Badge>
                          <Badge variant="outline">{q.category}</Badge>
                        </div>
                        <p className="font-medium text-foreground mb-2">{q.question}</p>
                        {q.answer && (
                          <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="w-4 h-4 text-primary" />
                              <span className="font-medium text-primary text-sm">{q.answeredBy || "Expert"}</span>
                            </div>
                            <p className="text-muted-foreground text-sm">{q.answer}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Community Q&A */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Community Q&A</h2>
              </div>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-questions"
                  />
                </div>
              </div>
              {questionsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                        <div className="h-20 bg-muted rounded" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredQuestions.length > 0 ? (
                <div className="space-y-4">
                  {filteredQuestions.map((q) => (
                    <Card key={q.id} className="border-border hover-elevate">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline">{q.category}</Badge>
                          <span className="text-xs text-muted-foreground">
                            Asked by {q.user?.name || "Anonymous"}
                          </span>
                        </div>
                        <p className="font-medium text-foreground mb-3">{q.question}</p>
                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-primary" />
                            <span className="font-medium text-primary text-sm">{q.answeredBy || "TurfguyRoss"}</span>
                          </div>
                          <p className="text-muted-foreground text-sm">{q.answer}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-border">
                  <CardContent className="p-8 text-center">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                      {searchQuery ? "No questions match your search" : "No answered questions yet"}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* About the Experts */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Meet Our Expert</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">TurfguyRoss</div>
                    <div className="text-sm text-muted-foreground">Golf Course Superintendent</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  30+ years of professional turf management experience. Certified by the Golf Course Superintendents Association.
                </p>
              </CardContent>
            </Card>

            {/* Popular Topics */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Popular Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Badge
                      key={cat}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => setSearchQuery(cat)}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Tips for Good Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    Include your grass type and region
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    Describe when the issue started
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    Mention any recent treatments
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    Be specific about the problem
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
