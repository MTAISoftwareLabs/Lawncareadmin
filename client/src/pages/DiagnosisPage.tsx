import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Leaf, Camera, Upload, X, Send, AlertTriangle, CheckCircle, 
  Loader2, ArrowRight, Clock, MessageCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { EmbeddedPageProps } from "@/components/MemberPageWrapper";
import { PageShell, PageContainer } from "@/components/MemberPageWrapper";
import { MarketingSiteHeader } from "@/components/MarketingSiteHeader";

interface Diagnosis {
  id: number;
  imageUrl: string;
  description: string;
  diagnosis: string;
  severity: string;
  recommendations: string[];
  status: string;
  createdAt: string;
}

export function DiagnosisPage({ embedded = false }: EmbeddedPageProps = {}) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const { data: diagnoses = [], isLoading: diagnosesLoading } = useQuery<Diagnosis[]>({
    queryKey: ["/api/diagnoses"],
    enabled: !!user,
  });

  const submitMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/diagnoses", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to submit diagnosis");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Diagnosis submitted!",
        description: "Our AI is analyzing your lawn issue.",
      });
      setSelectedImage(null);
      setImagePreview(null);
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["/api/diagnoses"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit diagnosis. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!selectedImage) {
      toast({
        title: "Image required",
        description: "Please upload a photo of your lawn issue.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedImage);
    formData.append("description", description);
    submitMutation.mutate(formData);
  };

  if (userLoading) {
    return (
      <PageShell embedded={embedded}>
        <div className={`flex items-center justify-center ${embedded ? "py-24" : "min-h-screen"}`}>
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell embedded={embedded}>
        {!embedded && <MarketingSiteHeader />}
        
        <PageContainer embedded={embedded} className={embedded ? "py-12 text-center" : "py-20 text-center"}>
          <Camera className="w-16 h-16 mx-auto mb-6 text-muted-foreground/50" />
          <h1 className="text-3xl font-bold text-foreground mb-4">AI Lawn Diagnosis</h1>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Upload photos of your lawn problems and get instant AI-powered diagnosis with treatment recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button variant="outline">Log In</Button>
            </Link>
            <Link href="/signup">
              <Button>Start Free Trial</Button>
            </Link>
          </div>
        </PageContainer>
      </PageShell>
    );
  }

  return (
    <PageShell embedded={embedded}>
      {!embedded && <MarketingSiteHeader user />}

      <PageContainer embedded={embedded} className="max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">AI Lawn Diagnosis</h1>
          <p className="text-muted-foreground">
            Upload a photo and describe your lawn issue to get instant AI-powered recommendations.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Form */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                New Diagnosis
              </CardTitle>
              <CardDescription>
                Take a clear photo of the affected area
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image Upload */}
              <div>
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full aspect-video object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                    <Upload className="w-10 h-10 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Click to upload photo</span>
                    <span className="text-xs text-muted-foreground mt-1">JPG, PNG up to 10MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      data-testid="input-diagnosis-image"
                    />
                  </label>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Describe the issue (optional)
                </label>
                <Textarea
                  placeholder="E.g., Brown patches appearing after rain, spreading slowly..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  data-testid="input-diagnosis-description"
                />
              </div>

              <Button 
                className="w-full"
                onClick={handleSubmit}
                disabled={!selectedImage || submitMutation.isPending}
                data-testid="button-submit-diagnosis"
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit for Diagnosis
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Previous Diagnoses */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Previous Diagnoses</h2>
            {diagnosesLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-20 bg-muted rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : diagnoses.length > 0 ? (
              <div className="space-y-4">
                {diagnoses.map((diagnosis) => (
                  <Card 
                    key={diagnosis.id} 
                    className="border-border hover-elevate cursor-pointer"
                    data-testid={`diagnosis-card-${diagnosis.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {diagnosis.imageUrl ? (
                            <img 
                              src={diagnosis.imageUrl} 
                              alt="Lawn issue"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Camera className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={
                              diagnosis.severity === 'high' ? 'bg-red-500' :
                              diagnosis.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                            }>
                              {diagnosis.severity} severity
                            </Badge>
                            <Badge variant="outline">
                              {diagnosis.status === 'completed' ? (
                                <><CheckCircle className="w-3 h-3 mr-1" /> Analyzed</>
                              ) : (
                                <><Clock className="w-3 h-3 mr-1" /> Pending</>
                              )}
                            </Badge>
                          </div>
                          <h3 className="font-medium text-foreground truncate">
                            {diagnosis.diagnosis || "Processing..."}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {diagnosis.description || "No description provided"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-border">
                <CardContent className="p-8 text-center">
                  <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No diagnoses yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Submit your first photo to get started
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Expert Help CTA */}
        <Card className="mt-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-semibold text-foreground">Need expert help?</h3>
              <p className="text-sm text-muted-foreground">
                Get personalized advice from our lawn care professionals
              </p>
            </div>
            <Link href="/app/questions">
              <Button>
                Ask an Expert
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </PageContainer>
    </PageShell>
  );
}
