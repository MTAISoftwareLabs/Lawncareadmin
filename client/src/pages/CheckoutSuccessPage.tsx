import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, Leaf, XCircle } from "lucide-react";

export default function CheckoutSuccessPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Confirming your subscription...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      setStatus("error");
      setMessage("Missing checkout session. Please contact support if you were charged.");
      return;
    }

    fetch(`/api/stripe/verify-session?session_id=${encodeURIComponent(sessionId)}`, {
      credentials: "include",
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error || "Failed to verify checkout");
        }
        setStatus("success");
        setMessage("Your premium membership is active. Welcome to the workshop!");
        await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      })
      .catch((error: Error) => {
        setStatus("error");
        setMessage(error.message || "We could not confirm your subscription yet.");
      });
  }, [queryClient]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <Leaf className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-bold">Lawncare Workshop</span>
        </div>
      </header>

      <main className="container flex min-h-[70vh] items-center justify-center py-12">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              {status === "loading" && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
              {status === "success" && <CheckCircle className="h-6 w-6 text-green-600" />}
              {status === "error" && <XCircle className="h-6 w-6 text-destructive" />}
              {status === "loading" && "Processing payment"}
              {status === "success" && "Subscription active"}
              {status === "error" && "Verification needed"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-muted-foreground">{message}</p>
            {status === "success" && (
              <Button className="w-full" onClick={() => navigate("/app")}>
                Open member app
              </Button>
            )}
            {status === "error" && (
              <div className="flex flex-col gap-2">
                <Button onClick={() => navigate("/pricing")}>Back to pricing</Button>
                <Link href="/contact">
                  <Button variant="outline" className="w-full">
                    Contact support
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
