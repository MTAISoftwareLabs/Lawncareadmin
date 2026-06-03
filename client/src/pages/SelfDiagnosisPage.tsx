import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  TreeDeciduous, ArrowRight, ArrowLeft, CheckCircle,
  AlertTriangle, HelpCircle, RefreshCw, Camera
} from "lucide-react";
import { useLocation } from "wouter";

interface DiagnosisOption {
  label: string;
  nextStep: string | null;
  result?: {
    title: string;
    description: string;
    severity: string;
    solutions: string[];
  };
}

interface DiagnosisQuestion {
  id: string;
  question: string;
  options: DiagnosisOption[];
}

interface DiagnosisFlow {
  id: number;
  title: string;
  imageUrl: string | null;
  questions: DiagnosisQuestion[] | string;
  displayOrder: number;
  isActive: boolean;
}

export function SelfDiagnosisPage() {
  const [, navigate] = useLocation();
  const [selectedFlow, setSelectedFlow] = useState<DiagnosisFlow | null>(null);
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [result, setResult] = useState<DiagnosisOption["result"] | null>(null);

  const { data: diagnosisFlows = [], isLoading } = useQuery<DiagnosisFlow[]>({
    queryKey: ["/api/self-diagnosis"],
  });

  const getQuestions = (flow: DiagnosisFlow): DiagnosisQuestion[] => {
    if (!flow.questions) return [];
    if (typeof flow.questions === "string") {
      try {
        return JSON.parse(flow.questions);
      } catch {
        return [];
      }
    }
    return flow.questions as DiagnosisQuestion[];
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "low":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "medium":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case "high":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <HelpCircle className="w-5 h-5" />;
    }
  };

  const startDiagnosis = (flow: DiagnosisFlow) => {
    const questions = getQuestions(flow);
    if (questions.length > 0) {
      setSelectedFlow(flow);
      setCurrentStepId(questions[0].id);
      setHistory([]);
      setResult(null);
    }
  };

  const handleOptionSelect = (option: DiagnosisOption) => {
    if (option.result) {
      setResult(option.result);
      setCurrentStepId(null);
    } else if (option.nextStep && selectedFlow) {
      setHistory([...history, currentStepId!]);
      setCurrentStepId(option.nextStep);
    }
  };

  const goBack = () => {
    if (history.length > 0) {
      const previousStep = history[history.length - 1];
      setHistory(history.slice(0, -1));
      setCurrentStepId(previousStep);
      setResult(null);
    } else {
      setSelectedFlow(null);
      setCurrentStepId(null);
      setResult(null);
    }
  };

  const resetDiagnosis = () => {
    if (selectedFlow) {
      const questions = getQuestions(selectedFlow);
      if (questions.length > 0) {
        setCurrentStepId(questions[0].id);
        setHistory([]);
        setResult(null);
      }
    }
  };

  if (selectedFlow) {
    const questions = getQuestions(selectedFlow);
    const currentStep = questions.find((q) => q.id === currentStepId);
    const totalSteps = questions.length;
    const currentStepIndex = questions.findIndex((q) => q.id === currentStepId);
    const progress = result ? 100 : ((currentStepIndex + 1) / totalSteps) * 100;

    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" onClick={goBack} data-testid="button-back">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              {!result && (
                <Button variant="ghost" onClick={resetDiagnosis} data-testid="button-reset">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Start Over
                </Button>
              )}
            </div>
            <h1 className="text-2xl font-bold mb-2">{selectedFlow.title}</h1>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              {result ? "Diagnosis Complete" : `Step ${currentStepIndex + 1} of ${totalSteps}`}
            </p>
          </div>

          {result ? (
            <Card className="border-2" data-testid="card-result">
              <CardHeader>
                <div className="flex items-center gap-3">
                  {getSeverityIcon(result.severity)}
                  <div>
                    <CardTitle>{result.title}</CardTitle>
                    <Badge className={getSeverityColor(result.severity)}>
                      {result.severity} Severity
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{result.description}</p>
                {result.solutions && result.solutions.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Recommended Solutions:</h4>
                    <ul className="space-y-2">
                      {result.solutions.map((solution: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{solution}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button onClick={() => setSelectedFlow(null)} variant="outline" data-testid="button-new-diagnosis">
                  New Diagnosis
                </Button>
                <Button onClick={() => navigate("/diagnosis")} data-testid="button-ai-diagnosis">
                  <Camera className="w-4 h-4 mr-2" />
                  Get AI Analysis
                </Button>
              </CardFooter>
            </Card>
          ) : currentStep ? (
            <Card data-testid="card-question">
              <CardHeader>
                <CardTitle className="text-xl">{currentStep.question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentStep.options.map((option: DiagnosisOption, index: number) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-between text-left h-auto py-4"
                    onClick={() => handleOptionSelect(option)}
                    data-testid={`button-option-${index}`}
                  >
                    <span>{option.label}</span>
                    <ArrowRight className="w-4 h-4 flex-shrink-0" />
                  </Button>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <HelpCircle className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No questions available</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Self-Diagnosis Tool</h1>
          <p className="text-muted-foreground">
            Answer a series of questions to identify lawn issues and get solutions
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-12 w-12 rounded-full mb-4" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : diagnosisFlows.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {diagnosisFlows.map((flow) => {
              const questions = getQuestions(flow);
              return (
                <Card key={flow.id} data-testid={`card-flow-${flow.id}`}>
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                      <TreeDeciduous className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle>{flow.title}</CardTitle>
                    <CardDescription>
                      {questions.length} diagnostic questions
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => startDiagnosis(flow)}
                      disabled={questions.length === 0}
                      data-testid={`button-start-${flow.id}`}
                    >
                      Start Diagnosis
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <TreeDeciduous className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Diagnosis Flows Available</h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                Self-diagnosis tools will be available soon. In the meantime, try our AI-powered diagnosis.
              </p>
              <Button onClick={() => navigate("/diagnosis")} data-testid="button-go-ai-diagnosis">
                <Camera className="w-4 h-4 mr-2" />
                Use AI Diagnosis
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-semibold text-lg mb-1">Prefer AI Analysis?</h3>
                <p className="text-sm text-muted-foreground">
                  Upload a photo of your lawn for instant AI-powered diagnosis
                </p>
              </div>
              <Button onClick={() => navigate("/diagnosis")} data-testid="button-ai-analysis">
                Use AI Diagnosis
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SelfDiagnosisPage;
