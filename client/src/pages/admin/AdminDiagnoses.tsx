import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, Loader2, Clock, CheckCircle, AlertTriangle, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Diagnosis {
  id: number;
  userId: number;
  imageUrl: string;
  description: string;
  diagnosis: string;
  severity: string;
  recommendations: string[];
  status: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

export function AdminDiagnoses() {
  const { toast } = useToast();
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<Diagnosis | null>(null);
  const [diagnosisText, setDiagnosisText] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [recommendations, setRecommendations] = useState("");

  const { data: diagnoses = [], isLoading } = useQuery<Diagnosis[]>({
    queryKey: ["/api/admin/diagnoses"],
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; diagnosis: string; severity: string; recommendations: string[]; status: string }) =>
      apiRequest(`/api/admin/diagnoses/${data.id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({ title: "Diagnosis updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/diagnoses"] });
      setSelectedDiagnosis(null);
    },
  });

  const handleView = (diagnosis: Diagnosis) => {
    setSelectedDiagnosis(diagnosis);
    setDiagnosisText(diagnosis.diagnosis || "");
    setSeverity(diagnosis.severity || "medium");
    setRecommendations(diagnosis.recommendations?.join("\n") || "");
  };

  const handleSubmit = () => {
    if (!selectedDiagnosis) return;
    updateMutation.mutate({
      id: selectedDiagnosis.id,
      diagnosis: diagnosisText,
      severity,
      recommendations: recommendations.split("\n").filter(r => r.trim()),
      status: "completed",
    });
  };

  const pendingDiagnoses = diagnoses.filter(d => d.status === 'pending');
  const completedDiagnoses = diagnoses.filter(d => d.status === 'completed');

  const severityColors: Record<string, string> = {
    low: "bg-green-500",
    medium: "bg-yellow-500",
    high: "bg-red-500",
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lawn Diagnoses</h1>
          <p className="text-muted-foreground">Review and respond to user diagnosis requests</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Pending Diagnoses */}
            {pendingDiagnoses.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  Pending Review ({pendingDiagnoses.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingDiagnoses.map((diagnosis) => (
                    <Card key={diagnosis.id} className="border-yellow-500/30">
                      <CardContent className="p-4">
                        <div className="aspect-video rounded-lg overflow-hidden bg-muted mb-4">
                          {diagnosis.imageUrl ? (
                            <img 
                              src={diagnosis.imageUrl} 
                              alt="Lawn issue"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Camera className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground">
                            {diagnosis.user?.name || "Anonymous"}
                          </span>
                          <Badge variant="outline">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {diagnosis.description || "No description provided"}
                        </p>
                        <div className="text-xs text-muted-foreground mb-3">
                          {formatDate(diagnosis.createdAt)}
                        </div>
                        <Button 
                          className="w-full" 
                          onClick={() => handleView(diagnosis)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Review & Diagnose
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Diagnoses */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Completed ({completedDiagnoses.length})
              </h2>
              {completedDiagnoses.length > 0 ? (
                <div className="space-y-4">
                  {completedDiagnoses.map((diagnosis) => (
                    <Card key={diagnosis.id} className="border-border">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
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
                              <span className="font-medium text-foreground">
                                {diagnosis.user?.name || "Anonymous"}
                              </span>
                              <Badge className={severityColors[diagnosis.severity] || 'bg-gray-500'}>
                                {diagnosis.severity} severity
                              </Badge>
                              <Badge variant="outline" className="text-green-600">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Completed
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {diagnosis.description}
                            </p>
                            <p className="text-sm font-medium text-foreground mb-1">
                              Diagnosis: {diagnosis.diagnosis}
                            </p>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(diagnosis.createdAt)}
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleView(diagnosis)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-border">
                  <CardContent className="p-12 text-center">
                    <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground">No completed diagnoses yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}

        {/* Diagnosis Dialog */}
        <Dialog open={!!selectedDiagnosis} onOpenChange={(open) => !open && setSelectedDiagnosis(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Diagnose Lawn Issue</DialogTitle>
            </DialogHeader>
            {selectedDiagnosis && (
              <div className="space-y-4">
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  {selectedDiagnosis.imageUrl ? (
                    <img 
                      src={selectedDiagnosis.imageUrl} 
                      alt="Lawn issue"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">User Description</h4>
                  <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                    {selectedDiagnosis.description || "No description provided"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Diagnosis</label>
                  <Textarea
                    placeholder="What's the issue? (e.g., Brown Patch Fungus, Grub Damage, etc.)"
                    value={diagnosisText}
                    onChange={(e) => setDiagnosisText(e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Severity</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                  >
                    <option value="low">Low - Minor issue, easy fix</option>
                    <option value="medium">Medium - Needs attention</option>
                    <option value="high">High - Urgent treatment needed</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Recommendations (one per line)</label>
                  <Textarea
                    placeholder="Enter treatment recommendations, one per line..."
                    value={recommendations}
                    onChange={(e) => setRecommendations(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={handleSubmit} 
                  className="w-full"
                  disabled={updateMutation.isPending || !diagnosisText.trim()}
                >
                  {updateMutation.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Submit Diagnosis
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
