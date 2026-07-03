import { Route, Switch, Redirect } from "wouter";
import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { PUBLIC_TO_MEMBER_REDIRECTS } from "@/lib/premiumAccess";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { ProfilePage } from "./pages/ProfilePage";
import { DealsPage } from "./pages/DealsPage";
import { BlogListPage } from "./pages/BlogListPage";
import { BlogPostPage } from "./pages/BlogPostPage";
import { HelpCenterPage } from "./pages/HelpCenterPage";
import { StaticPage } from "./pages/StaticPage";
import Contact from "./pages/Contact";
import PricingPage from "./pages/PricingPage";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { MemberHomePageRoute } from "./pages/member/MemberHomePage";
import { MemberSearchPage } from "./pages/member/MemberSearchPage";
import { ContentSectionPage } from "./pages/member/ContentSectionPage";
import { AiChatPage } from "./pages/member/AiChatPage";
import {
  MemberForumPage,
  MemberLessonsPage,
  MemberLibraryPage,
  MemberCompetitionsPage,
  MemberExpertQAPage,
  MemberProfilePage,
  MemberDealsPage,
  MemberCalendarsPage,
  MemberSelfDiagnosisPage,
  MemberCarePlansPage,
  MemberGrassTypesPage,
  MemberChatPage,
  MemberDiagnosisPage,
} from "./pages/member/MemberEmbedPages";
import { MemberNotificationsPage } from "./pages/member/MemberNotificationsPage";
import { MemberSavedItemsPage } from "./pages/member/MemberSavedItemsPage";
import { MemberMyContentPage } from "./pages/member/MemberMyContentPage";
import { MemberProfileSettingsPage } from "./pages/member/MemberProfileSettingsPage";
import { MemberPrivacyPage, MemberRulesPage } from "./pages/member/MemberPrivacyPage";

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
import { AdminIntegrations } from "./pages/admin/AdminIntegrations";
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
            <Route path="/deals" component={DealsPage} />
            {Object.entries(PUBLIC_TO_MEMBER_REDIRECTS).map(([from, to]) => (
              <Route key={from} path={from}>
                <Redirect to={to} />
              </Route>
            ))}
            <Route path="/blog" component={BlogListPage} />
            <Route path="/blog/:slug" component={BlogPostPage} />
            <Route path="/help-center" component={HelpCenterPage} />
            <Route path="/contact" component={Contact} />
            <Route path="/pricing" component={PricingPage} />
            <Route path="/checkout/success" component={CheckoutSuccessPage} />
            <Route path="/page/:slug" component={StaticPage} />
            
            {/* Member workspace (browser app) */}
            <Route path="/app" component={MemberHomePageRoute} />
            <Route path="/app/search" component={MemberSearchPage} />
            <Route path="/app/section/:section" component={ContentSectionPage} />
            <Route path="/app/ai" component={AiChatPage} />
            <Route path="/app/forum" component={MemberForumPage} />
            <Route path="/app/lessons" component={MemberLessonsPage} />
            <Route path="/app/library" component={MemberLibraryPage} />
            <Route path="/app/competitions" component={MemberCompetitionsPage} />
            <Route path="/app/questions" component={MemberExpertQAPage} />
            <Route path="/app/profile" component={MemberProfilePage} />
            <Route path="/app/deals" component={MemberDealsPage} />
            <Route path="/app/calendars" component={MemberCalendarsPage} />
            <Route path="/app/self-diagnosis" component={MemberSelfDiagnosisPage} />
            <Route path="/app/care-plans" component={MemberCarePlansPage} />
            <Route path="/app/grass-types" component={MemberGrassTypesPage} />
            <Route path="/app/chat" component={MemberChatPage} />
            <Route path="/app/diagnosis" component={MemberDiagnosisPage} />
            <Route path="/app/notifications" component={MemberNotificationsPage} />
            <Route path="/app/saved" component={MemberSavedItemsPage} />
            <Route path="/app/my-content" component={MemberMyContentPage} />
            <Route path="/app/settings" component={MemberProfileSettingsPage} />
            <Route path="/app/privacy" component={MemberPrivacyPage} />
            <Route path="/app/rules" component={MemberRulesPage} />
            <Route path="/dashboard">
              <Redirect to="/app" />
            </Route>
            
            {/* Protected User Routes */}
            <Route path="/profile" component={ProfilePage} />
            
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
            <Route path="/admin/integrations" component={AdminIntegrations} />
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
