import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Eye, EyeOff, UserRound } from "lucide-react";
import { motion } from "framer-motion";
import { getPostAuthRedirect } from "@/lib/authRedirect";
import { setGuestBrowseMode } from "@/lib/premiumAccess";
import logoUrl from "@assets/logo_1768933994269.jpeg";

export function LoginPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const nextPath = getPostAuthRedirect("/app");
  const signupHref = nextPath === "/app" ? "/signup" : `/signup?next=${encodeURIComponent(nextPath)}`;

  const loginMutation = useMutation({
    mutationFn: () => api.auth.login(formData),
    onSuccess: () => {
      setGuestBrowseMode(false);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation(getPostAuthRedirect("/app"));
    },
    onError: (err: any) => {
      setError(err.message || "Login failed");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Link href="/" className="flex items-center gap-2 text-muted-foreground mb-6 hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <Card className="shadow-xl border-2">
          <CardHeader className="text-center pb-2">
            <img src={logoUrl} alt="Lawncare Workshop" className="w-16 h-16 mx-auto mb-4 rounded-full object-cover" />
            <CardTitle className="text-2xl" data-testid="text-login-title">Welcome Back</CardTitle>
            <CardDescription>Sign in to your Lawncare Workshop account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm" data-testid="text-login-error">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  data-testid="input-login-email"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">Password</label>
                  <Link href="/forgot-password" className="text-xs text-primary hover:underline" data-testid="link-forgot-password">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    data-testid="input-login-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loginMutation.isPending} data-testid="button-login-submit">
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={async () => {
                  setGuestBrowseMode(true);
                  try {
                    await api.auth.logout();
                  } catch {
                    // Ignore — ensure no stale premium session while browsing as guest
                  }
                  queryClient.removeQueries({ queryKey: ["/api/auth/me"] });
                  queryClient.removeQueries({ queryKey: ["user"] });
                  setLocation(nextPath);
                }}
                data-testid="button-continue-guest"
              >
                <UserRound className="mr-2 h-4 w-4" />
                Continue as Guest
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href={signupHref} className="text-primary font-medium hover:underline" data-testid="link-signup">
                  Start your free trial
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}
