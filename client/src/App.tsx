import { Route, Switch, Redirect } from "wouter";
import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { ProfilePage } from "./pages/ProfilePage";
import { DashboardPage } from "./pages/DashboardPage";
import { LessonsPage } from "./pages/LessonsPage";
import { DiagnosisPage } from "./pages/DiagnosisPage";
import { DealsPage } from "./pages/DealsPage";
import { CompetitionsPage } from "./pages/CompetitionsPage";
import { ExpertQAPage } from "./pages/ExpertQAPage";
import { BlogListPage } from "./pages/BlogListPage";
import { BlogPostPage } from "./pages/BlogPostPage";
import { HelpCenterPage } from "./pages/HelpCenterPage";
import { StaticPage } from "./pages/StaticPage";
import Contact from "./pages/Contact";
import PricingPage from "./pages/PricingPage";
import { ForumPage } from "./pages/ForumPage";
import { ChatPage } from "./pages/ChatPage";
import { CarePlansPage } from "./pages/CarePlansPage";
import { LibraryPage } from "./pages/LibraryPage";
import { SelfDiagnosisPage } from "./pages/SelfDiagnosisPage";
import { CalendarsPage } from "./pages/CalendarsPage";
import { GrassTypesPage } from "./pages/GrassTypesPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";

import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminGrassTypes } from "./pages/admin/AdminGrassTypes";
import { AdminLessons } from "./pages/admin/AdminLessons";
import { AdminPlans } from "./pages/admin/AdminPlans";
import { AdminDeals } from "./pages/admin/AdminDeals";
import { AdminCompetitions } from "./pages/admin/AdminCompetitions";
import { AdminDiagnoses } from "./pages/admin/AdminDiagnoses";
import { AdminBlogPage } from "./pages/admin/AdminBlogPage";
import { AdminFaqs } from "./pages/admin/AdminFaqs";
import { AdminTestimonials } from "./pages/admin/AdminTestimonials";
import { AdminSettings } from "./pages/admin/AdminSettings";
import { AdminPages } from "./pages/admin/AdminPages";
import { AdminPrivacyContent } from "./pages/admin/AdminPrivacyContent";
import { AdminBanners } from "./pages/admin/AdminBanners";
import { AdminPushNotifications } from "./pages/admin/AdminPushNotifications";
import { AdminLibrary } from "./pages/admin/AdminLibrary";
import { AdminForum } from "./pages/admin/AdminForum";
import { AdminConfigManagement } from "./pages/admin/AdminConfigManagement";
import { AdminEmailSettings } from "./pages/admin/AdminEmailSettings";
import { AdminHomeContent } from "./pages/admin/AdminHomeContent";
import { AdminCalendars } from "./pages/admin/AdminCalendars";
import { AdminSelfDiagnosis } from "./pages/admin/AdminSelfDiagnosis";
import { AdminLawnLibrary } from "./pages/admin/AdminLawnLibrary";
import { AdminSupportTickets } from "./pages/admin/AdminSupportTickets";
import AdminUserChats from "./pages/admin/AdminUserChats";
import { AdminProfile } from "./pages/admin/AdminProfile";
import { AdminRevenueCat } from "./pages/admin/AdminRevenueCat";

function App() {
  useEffect(() => {
    fetch('/health')
      .then(res => res.json())
      .then(data => {
        console.log('Frontend-Backend Connection: OK');
        console.log('Backend Health:', data);
      })
      .catch(err => {
        console.error('Frontend-Backend Connection: FAILED', err);
      });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          <Switch>
            {/* Public Routes */}
            <Route path="/" component={HomePage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/signup" component={SignupPage} />
            <Route path="/forgot-password" component={ForgotPasswordPage} />
            <Route path="/reset-password/:token" component={ResetPasswordPage} />
            <Route path="/lessons" component={LessonsPage} />
            <Route path="/deals" component={DealsPage} />
            <Route path="/competitions" component={CompetitionsPage} />
            <Route path="/blog" component={BlogListPage} />
            <Route path="/blog/:slug" component={BlogPostPage} />
            <Route path="/help-center" component={HelpCenterPage} />
            <Route path="/contact" component={Contact} />
            <Route path="/pricing" component={PricingPage} />
            <Route path="/page/:slug" component={StaticPage} />
            
            {/* Protected User Routes */}
            <Route path="/dashboard" component={DashboardPage} />
            <Route path="/profile" component={ProfilePage} />
            <Route path="/diagnosis" component={DiagnosisPage} />
            <Route path="/expert-qa" component={ExpertQAPage} />
            <Route path="/forum" component={ForumPage} />
            <Route path="/chat" component={ChatPage} />
            <Route path="/care-plans" component={CarePlansPage} />
            <Route path="/library" component={LibraryPage} />
            <Route path="/self-diagnosis" component={SelfDiagnosisPage} />
            <Route path="/calendars" component={CalendarsPage} />
            <Route path="/grass-types" component={GrassTypesPage} />
            
            {/* Admin Routes */}
            <Route path="/admin">
              <Redirect to="/admin/login" />
            </Route>
            <Route path="/admin/login" component={AdminLogin} />
            <Route path="/admin/dashboard" component={AdminDashboard} />
            <Route path="/admin/users" component={AdminUsers} />
            <Route path="/admin/support" component={AdminSupportTickets} />
            <Route path="/admin/user-chats" component={AdminUserChats} />
            <Route path="/admin/grass-types" component={AdminGrassTypes} />
            <Route path="/admin/lessons" component={AdminLessons} />
            <Route path="/admin/plans" component={AdminPlans} />
            <Route path="/admin/deals" component={AdminDeals} />
            <Route path="/admin/competitions" component={AdminCompetitions} />
            <Route path="/admin/diagnoses" component={AdminDiagnoses} />
            <Route path="/admin/blog" component={AdminBlogPage} />
            <Route path="/admin/faqs" component={AdminFaqs} />
            <Route path="/admin/testimonials" component={AdminTestimonials} />
            <Route path="/admin/settings" component={AdminSettings} />
            <Route path="/admin/pages" component={AdminPages} />
            <Route path="/admin/privacy-content" component={AdminPrivacyContent} />
            <Route path="/admin/banners" component={AdminBanners} />
            <Route path="/admin/push-notifications" component={AdminPushNotifications} />
            <Route path="/admin/library" component={AdminLibrary} />
            <Route path="/admin/forum" component={AdminForum} />
            <Route path="/admin/config" component={AdminConfigManagement} />
            <Route path="/admin/email-settings" component={AdminEmailSettings} />
            <Route path="/admin/home-content" component={AdminHomeContent} />
            <Route path="/admin/calendars" component={AdminCalendars} />
            <Route path="/admin/self-diagnosis" component={AdminSelfDiagnosis} />
            <Route path="/admin/lawn-library" component={AdminLawnLibrary} />
            <Route path="/admin/profile" component={AdminProfile} />
            <Route path="/admin/revenuecat" component={AdminRevenueCat} />
            
            {/* 404 */}
            <Route>
              <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
                  <p className="text-muted-foreground mb-4">Page not found</p>
                  <a href="/" className="text-primary hover:underline">Go back home</a>
                </div>
              </div>
            </Route>
          </Switch>
        </main>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
