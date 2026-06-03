import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, Play, Calendar, Trophy, Camera, MessageSquare, 
  ShoppingBag, Bell, BookOpen, Star, HelpCircle, Leaf,
  TrendingUp, Crown, Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminLayout } from "@/components/AdminLayout";
import { useLocation } from "wouter";

function AdminDashboardContent() {
  const [, setLocation] = useLocation();

  const { data: users } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const { data: lessons } = useQuery({
    queryKey: ["/api/lessons"],
  });

  const { data: plans } = useQuery({
    queryKey: ["/api/plans"],
  });

  const { data: competitions } = useQuery({
    queryKey: ["/api/admin/competitions"],
  });

  const { data: diagnoses } = useQuery({
    queryKey: ["/api/admin/diagnoses"],
  });

  const { data: supportTickets } = useQuery({
    queryKey: ["/api/admin/support/tickets"],
  });

  const { data: deals } = useQuery({
    queryKey: ["/api/deals"],
  });

  const { data: testimonials } = useQuery({
    queryKey: ["/api/admin/testimonials"],
  });

  const { data: forumPosts } = useQuery({
    queryKey: ["/api/admin/forum/posts"],
  });

  const usersArray = Array.isArray(users) ? users : [];
  const lessonsArray = Array.isArray(lessons) ? lessons : [];
  const plansArray = Array.isArray(plans) ? plans : [];
  const competitionsArray = Array.isArray(competitions) ? competitions : [];
  const diagnosesArray = Array.isArray(diagnoses) ? diagnoses : [];
  const ticketsArray = Array.isArray(supportTickets) ? supportTickets : [];
  const dealsArray = Array.isArray(deals) ? deals : [];
  const testimonialsArray = Array.isArray(testimonials) ? testimonials : [];
  const forumArray = Array.isArray(forumPosts) ? forumPosts : [];

  const subscribedUsers = usersArray.filter((u: any) => u.subscriptionStatus === 'active').length;
  const pendingDiagnoses = diagnosesArray.filter((d: any) => d.status === 'pending').length;
  const openTickets = ticketsArray.filter((t: any) => t.status === 'open' || t.status === 'in_progress').length;

  const stats = [
    {
      title: "Total Users",
      value: usersArray.length,
      subtitle: `${subscribedUsers} subscribers`,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      path: "/admin/users"
    },
    {
      title: "Video Lessons",
      value: lessonsArray.length,
      subtitle: "Educational content",
      icon: Play,
      color: "from-red-500 to-orange-500",
      path: "/admin/lessons"
    },
    {
      title: "Care Plans",
      value: plansArray.length,
      subtitle: "Custom lawn plans",
      icon: Calendar,
      color: "from-green-500 to-emerald-500",
      path: "/admin/plans"
    },
    {
      title: "Active Deals",
      value: dealsArray.length,
      subtitle: "Product marketplace",
      icon: ShoppingBag,
      color: "from-purple-500 to-violet-500",
      path: "/admin/deals"
    },
  ];

  const secondaryStats = [
    {
      title: "Competitions",
      value: competitionsArray.length,
      icon: Trophy,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
      path: "/admin/competitions"
    },
    {
      title: "Diagnoses",
      value: diagnosesArray.length,
      pending: pendingDiagnoses,
      icon: Camera,
      color: "text-cyan-500",
      bgColor: "bg-cyan-50 dark:bg-cyan-950/30",
      path: "/admin/diagnoses"
    },
    {
      title: "Forum Posts",
      value: forumArray.length,
      icon: MessageSquare,
      color: "text-sky-500",
      bgColor: "bg-sky-50 dark:bg-sky-950/30",
      path: "/admin/forum"
    },
    {
      title: "Testimonials",
      value: testimonialsArray.length,
      icon: Star,
      color: "text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
      path: "/admin/testimonials"
    },
  ];

  return (
    <AdminLayout>
      <div className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 text-white py-8 -m-6 mb-6 px-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <Leaf className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Lawncare Workshop Dashboard</h1>
            <p className="text-green-100 mt-1">Monitor your platform performance and manage content</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`p-5 bg-gradient-to-br ${stat.color} text-white cursor-pointer hover:shadow-lg transition-shadow`}
                onClick={() => setLocation(stat.path)}
                data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">{stat.title}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    <p className="text-xs opacity-75 mt-1">{stat.subtitle}</p>
                  </div>
                  <stat.icon className="h-10 w-10 opacity-80" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {secondaryStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Card 
                className={`p-4 ${stat.bgColor} cursor-pointer hover:shadow-md transition-shadow`}
                onClick={() => setLocation(stat.path)}
                data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-white dark:bg-gray-800 ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.title}</p>
                    {stat.pending !== undefined && stat.pending > 0 && (
                      <p className="text-xs text-orange-600 font-medium">{stat.pending} pending</p>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-purple-500" />
              <h2 className="text-lg font-bold">Support Tickets</h2>
              {openTickets > 0 && (
                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                  {openTickets} open
                </span>
              )}
            </div>
            <div className="space-y-3">
              {ticketsArray.slice(0, 4).map((ticket: any) => (
                <div
                  key={ticket.id}
                  className="flex justify-between items-center border-b border-border pb-2"
                  data-testid={`ticket-${ticket.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {ticket.userName || 'User'}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    ticket.status === 'open' ? 'bg-yellow-100 text-yellow-700' :
                    ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
              ))}
              {ticketsArray.length === 0 && (
                <p className="text-muted-foreground text-center py-4 text-sm">No support tickets</p>
              )}
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => setLocation("/admin/support")}
              data-testid="button-view-tickets"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              View All Tickets
            </Button>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Camera className="h-5 w-5 text-cyan-500" />
              <h2 className="text-lg font-bold">Recent Diagnoses</h2>
              {pendingDiagnoses > 0 && (
                <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-medium rounded-full">
                  {pendingDiagnoses} pending
                </span>
              )}
            </div>
            <div className="space-y-3">
              {diagnosesArray.slice(0, 4).map((diagnosis: any) => (
                <div
                  key={diagnosis.id}
                  className="flex justify-between items-center border-b border-border pb-2"
                  data-testid={`diagnosis-${diagnosis.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{diagnosis.title || 'Diagnosis Request'}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(diagnosis.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    diagnosis.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    diagnosis.status === 'reviewed' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {diagnosis.status}
                  </span>
                </div>
              ))}
              {diagnosesArray.length === 0 && (
                <p className="text-muted-foreground text-center py-4 text-sm">No diagnoses submitted</p>
              )}
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => setLocation("/admin/diagnoses")}
              data-testid="button-view-diagnoses"
            >
              <Camera className="mr-2 h-4 w-4" />
              Review Diagnoses
            </Button>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <h2 className="text-lg font-bold">Quick Actions</h2>
            </div>
            <div className="space-y-2">
              <Button
                className="w-full justify-start bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                onClick={() => setLocation("/admin/lessons")}
                data-testid="button-manage-lessons"
              >
                <Play className="mr-2 h-4 w-4" />
                Manage Video Lessons
              </Button>
              <Button
                className="w-full justify-start bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                onClick={() => setLocation("/admin/plans")}
                data-testid="button-manage-plans"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Manage Care Plans
              </Button>
              <Button
                className="w-full justify-start bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                onClick={() => setLocation("/admin/competitions")}
                data-testid="button-manage-competitions"
              >
                <Trophy className="mr-2 h-4 w-4" />
                Manage Competitions
              </Button>
              <Button
                className="w-full justify-start bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                onClick={() => setLocation("/admin/push-notifications")}
                data-testid="button-send-notification"
              >
                <Bell className="mr-2 h-4 w-4" />
                Send Push Notification
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setLocation("/")}
                data-testid="button-view-site"
              >
                <Leaf className="mr-2 h-4 w-4 text-green-500" />
                View Public Site
              </Button>
            </div>
          </Card>
        </div>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold">Subscription Overview</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <p className="text-3xl font-bold text-green-600">{subscribedUsers}</p>
              <p className="text-sm text-muted-foreground">Active Subscribers</p>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">{usersArray.length}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
              <p className="text-3xl font-bold text-purple-600">{lessonsArray.length}</p>
              <p className="text-sm text-muted-foreground">Video Lessons</p>
            </div>
            <div className="text-center p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
              <p className="text-3xl font-bold text-amber-600">{competitionsArray.length}</p>
              <p className="text-sm text-muted-foreground">Competitions</p>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}

export function AdminDashboard() {
  return (
    <AdminGuard>
      <AdminDashboardContent />
    </AdminGuard>
  );
}
