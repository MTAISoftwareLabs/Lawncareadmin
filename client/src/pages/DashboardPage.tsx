import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Leaf, Calendar, Play, Camera, ShoppingBag, Trophy, MessageCircle,
  Sun, CloudRain, Thermometer, Droplets, ChevronRight, Clock, User,
  LogOut, Settings, Bell
} from "lucide-react";
import { motion } from "framer-motion";

interface User {
  id: number;
  name: string;
  email: string;
  subscriptionStatus: string;
}

interface LawnProfile {
  id: number;
  name: string;
  grassTypeId: number;
  zipCode: string;
  lawnSize: number;
}

interface LawnCarePlan {
  id: number;
  title: string;
  description: string;
  season: string;
  month: number;
  taskType: string;
  priority: string;
}

export function DashboardPage() {
  const [, setLocation] = useLocation();

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const { data: lawnProfiles = [] } = useQuery<LawnProfile[]>({
    queryKey: ["/api/lawn-profiles"],
    enabled: !!user,
  });

  const { data: upcomingPlans = [] } = useQuery<LawnCarePlan[]>({
    queryKey: ["/api/lawn-plans/upcoming"],
    enabled: !!user,
  });

  const { data: recentLessons = [] } = useQuery<any[]>({
    queryKey: ["/api/lessons/recent"],
    enabled: !!user,
  });

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  const currentMonth = new Date().getMonth() + 1;
  const season = currentMonth >= 3 && currentMonth <= 5 ? "spring" : 
                 currentMonth >= 6 && currentMonth <= 8 ? "summer" :
                 currentMonth >= 9 && currentMonth <= 11 ? "fall" : "winter";

  const quickActions = [
    { icon: Calendar, label: "View Care Plan", href: "/dashboard/plans", color: "bg-blue-500/10 text-blue-600" },
    { icon: Play, label: "Watch Lessons", href: "/lessons", color: "bg-purple-500/10 text-purple-600" },
    { icon: Camera, label: "Diagnose Issue", href: "/diagnosis", color: "bg-orange-500/10 text-orange-600" },
    { icon: ShoppingBag, label: "Browse Deals", href: "/deals", color: "bg-green-500/10 text-green-600" },
    { icon: Trophy, label: "Competitions", href: "/competitions", color: "bg-yellow-500/10 text-yellow-600" },
    { icon: MessageCircle, label: "Ask Expert", href: "/expert-qa", color: "bg-pink-500/10 text-pink-600" },
  ];

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
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <Link href="/profile">
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user.name?.split(' ')[0] || 'Friend'}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your lawn this {season}.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weather Widget */}
            <Card className="border-border overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Today's Conditions</h3>
                    <p className="text-sm text-muted-foreground">Perfect day for lawn care!</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <Sun className="w-8 h-8 text-yellow-500 mx-auto mb-1" />
                      <span className="text-2xl font-bold text-foreground">72°F</span>
                      <p className="text-xs text-muted-foreground">Air Temp</p>
                    </div>
                    <div className="text-center">
                      <Thermometer className="w-8 h-8 text-orange-500 mx-auto mb-1" />
                      <span className="text-2xl font-bold text-foreground">58°F</span>
                      <p className="text-xs text-muted-foreground">Soil Temp</p>
                    </div>
                    <div className="text-center">
                      <Droplets className="w-8 h-8 text-blue-500 mx-auto mb-1" />
                      <span className="text-2xl font-bold text-foreground">45%</span>
                      <p className="text-xs text-muted-foreground">Humidity</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={action.href}>
                    <Card className="hover-elevate cursor-pointer border-border h-full">
                      <CardContent className="p-4 flex flex-col items-center text-center">
                        <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                          <action.icon className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-foreground">{action.label}</span>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Upcoming Tasks */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Upcoming Tasks
                </CardTitle>
                <CardDescription>Your personalized lawn care schedule</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingPlans.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingPlans.slice(0, 3).map((plan) => (
                      <div 
                        key={plan.id} 
                        className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover-elevate"
                      >
                        <div className={`w-2 h-12 rounded-full ${
                          plan.priority === 'high' ? 'bg-red-500' :
                          plan.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{plan.title}</h4>
                          <p className="text-sm text-muted-foreground">{plan.description}</p>
                        </div>
                        <Badge variant="secondary">{plan.taskType}</Badge>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No upcoming tasks scheduled</p>
                    <Link href="/dashboard/plans">
                      <Button variant="link" className="mt-2">Set up your lawn profile</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription Status */}
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">Subscription</span>
                  <Badge className={
                    user.subscriptionStatus === 'premium' ? 'bg-primary' :
                    user.subscriptionStatus === 'trial' ? 'bg-yellow-500' : 'bg-muted'
                  }>
                    {user.subscriptionStatus === 'premium' ? 'Premium' :
                     user.subscriptionStatus === 'trial' ? 'Trial' : 'Free'}
                  </Badge>
                </div>
                {user.subscriptionStatus !== 'premium' && (
                  <Link href="/profile">
                    <Button className="w-full" size="sm">
                      Upgrade to Premium
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Lawn Profiles */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">My Lawns</CardTitle>
              </CardHeader>
              <CardContent>
                {lawnProfiles.length > 0 ? (
                  <div className="space-y-3">
                    {lawnProfiles.map((profile) => (
                      <div 
                        key={profile.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover-elevate cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Leaf className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-foreground text-sm">{profile.name}</div>
                          <div className="text-xs text-muted-foreground">{profile.lawnSize} sq ft</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-3">No lawn profiles yet</p>
                    <Button size="sm" variant="outline">Add Lawn Profile</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Continue Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/lessons">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover-elevate cursor-pointer">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <Play className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-foreground text-sm">Spring Lawn Revival</div>
                        <div className="text-xs text-muted-foreground">Continue where you left off</div>
                      </div>
                    </div>
                  </Link>
                </div>
                <Link href="/lessons">
                  <Button variant="ghost" className="w-full mt-3" size="sm">
                    View All Lessons
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
