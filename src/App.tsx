import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { usePageViewTracking } from "@/hooks/usePageViewTracking";

// Layouts
import PublicLayout from "@/components/layout/PublicLayout";
import AdminLayout from "@/components/layout/AdminLayout";

// Pages
import HomePage from "@/pages/HomePage";
import ObjectivesPage from "@/pages/ObjectivesPage";
import ObjectiveSingle from "@/pages/ObjectiveSingle";
import FavoritesPage from "@/pages/FavoritesPage";
import UserDashboard from "@/pages/UserDashboard";
import NewsletterConfirm from "@/pages/NewsletterConfirm";
import NewsletterUnsubscribe from "@/pages/NewsletterUnsubscribe";
import GuidesPage from "@/pages/GuidesPage";
import GuideSinglePage from "@/pages/GuideSinglePage";
import BlogPage from "@/pages/BlogPage";
import BlogArticle from "@/pages/BlogArticle";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import AdminDashboard from "@/pages/admin/Dashboard";
import ObjectivesAdmin from "@/pages/admin/ObjectivesAdmin";
import ObjectiveForm from "@/pages/admin/ObjectiveForm";
import GuidesAdmin from "@/pages/admin/GuidesAdmin";
import GuideForm from "@/pages/admin/GuideForm";
import AuthorizedGuidesAdmin from "@/pages/admin/AuthorizedGuidesAdmin";
import ReviewsAdmin from "@/pages/admin/ReviewsAdmin";
import ObjectiveReviewsAdmin from "@/pages/admin/ObjectiveReviewsAdmin";
import GuideReviewsAdmin from "@/pages/admin/GuideReviewsAdmin";
import BlogAdmin from "@/pages/admin/BlogAdmin";
import BlogArticleForm from "@/pages/admin/BlogArticleForm";
import CircuitsAdmin from "@/pages/admin/CircuitsAdmin";
import CircuitForm from "@/pages/admin/CircuitForm";
import MediaLibrary from "@/pages/admin/MediaLibrary";
import Settings from "@/pages/admin/Settings";
import UsersPage from "@/pages/admin/Users";
import BulkImport from "@/pages/admin/BulkImport";
import Analytics from "@/pages/admin/Analytics";
import Templates from "@/pages/admin/Templates";
import NewsletterAdmin from "@/pages/admin/NewsletterAdmin";
import ContactMessagesAdmin from "@/pages/admin/ContactMessagesAdmin";
import LoginPage from "@/pages/auth/Login";
import ResetPasswordPage from "@/pages/auth/ResetPassword";
import NotFound from "@/pages/NotFound";
import TestDatabase from "@/pages/TestDatabase";
import ForumHomePage from "@/pages/ForumHomePage";
import ForumCategoryPage from "@/pages/ForumCategoryPage";
import ForumPostPage from "@/pages/ForumPostPage";
import ForumAdmin from "@/pages/admin/ForumAdmin";
import UserProfile from "@/pages/UserProfile";
import ActivityFeed from "@/pages/ActivityFeed";
import Leaderboards from "@/pages/Leaderboards";
import TravelJournals from "@/pages/TravelJournals";
import CreateJournal from "@/pages/CreateJournal";
import JournalSingle from "@/pages/JournalSingle";
import PhotoContests from "@/pages/PhotoContests";
import ContestSingle from "@/pages/ContestSingle";
import CommunityChallenges from "@/pages/CommunityChallenges";
import SuggestObjective from "@/pages/SuggestObjective";
import SuggestionsAdmin from "@/pages/admin/SuggestionsAdmin";
import ContestsAdmin from "@/pages/admin/ContestsAdmin";
import ChallengesAdmin from "@/pages/admin/ChallengesAdmin";
import ActivityLogs from "@/pages/admin/ActivityLogs";
import UserBanManagement from "@/pages/admin/UserBanManagement";
import ScheduledActions from "@/pages/admin/ScheduledActions";
import { AIChatbot } from "@/components/features/ai/AIChatbot";

const queryClient = new QueryClient();

// Analytics tracking component
const AnalyticsTracker = () => {
  usePageViewTracking();
  return null;
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AnalyticsTracker />
              <AIChatbot />
              <LanguageProvider>
                <Routes>
            {/* Public Routes - with optional language prefix */}
            <Route path="/:lang?" element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="obiective" element={<ObjectivesPage />} />
              <Route path="obiective/:slug" element={<ObjectiveSingle />} />
              <Route path="favorite" element={<FavoritesPage />} />
              <Route path="dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
              <Route path="newsletter/confirmare" element={<NewsletterConfirm />} />
              <Route path="newsletter/dezabonare" element={<NewsletterUnsubscribe />} />
              <Route path="ghizi" element={<GuidesPage />} />
              <Route path="ghid/:slug" element={<GuideSinglePage />} />
              <Route path="blog" element={<BlogPage />} />
              <Route path="blog/:slug" element={<BlogArticle />} />
              <Route path="despre" element={<AboutPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="forum" element={<ForumHomePage />} />
              <Route path="forum/:categorySlug" element={<ForumCategoryPage />} />
              <Route path="forum/:categorySlug/:postSlug" element={<ForumPostPage />} />
              <Route path="user/:username" element={<UserProfile />} />
              <Route path="feed" element={<ActivityFeed />} />
              <Route path="leaderboards" element={<Leaderboards />} />
              <Route path="journals" element={<TravelJournals />} />
              <Route path="journals/new" element={<ProtectedRoute><CreateJournal /></ProtectedRoute>} />
              <Route path="journals/:slug" element={<JournalSingle />} />
              <Route path="contests" element={<PhotoContests />} />
              <Route path="contests/:slug" element={<ContestSingle />} />
              <Route path="challenges" element={<CommunityChallenges />} />
              <Route path="suggest-objective" element={<ProtectedRoute><SuggestObjective /></ProtectedRoute>} />
            </Route>

            {/* Admin Routes - Protected */}
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="obiective" element={<ObjectivesAdmin />} />
              <Route path="obiective/nou" element={<ObjectiveForm />} />
              <Route path="obiective/:id" element={<ObjectiveForm />} />
              <Route path="ghizi" element={<GuidesAdmin />} />
              <Route path="ghizi/nou" element={<GuideForm />} />
              <Route path="ghizi/:id/edit" element={<GuideForm />} />
              <Route path="ghizi-autorizati" element={<AuthorizedGuidesAdmin />} />
              <Route path="recenzii" element={<ReviewsAdmin />} />
              <Route path="recenzii-ghizi" element={<GuideReviewsAdmin />} />
              <Route path="recenzii-obiective" element={<ObjectiveReviewsAdmin />} />
              <Route path="blog" element={<BlogAdmin />} />
              <Route path="blog/nou" element={<BlogArticleForm />} />
              <Route path="blog/:id" element={<BlogArticleForm />} />
              <Route path="circuite" element={<CircuitsAdmin />} />
              <Route path="circuite/nou" element={<CircuitForm />} />
              <Route path="circuite/:id" element={<CircuitForm />} />
              <Route path="media" element={<MediaLibrary />} />
              <Route path="newsletter" element={<NewsletterAdmin />} />
              <Route path="mesaje-contact" element={<ContactMessagesAdmin />} />
              <Route path="setari" element={<Settings />} />
              <Route path="utilizatori" element={<ProtectedRoute requireRole="admin"><UsersPage /></ProtectedRoute>} />
              <Route path="import" element={<BulkImport />} />
              <Route path="templates" element={<Templates />} />
              <Route path="suggestions" element={<SuggestionsAdmin />} />
              <Route path="contests" element={<ContestsAdmin />} />
              <Route path="challenges" element={<ChallengesAdmin />} />
              <Route path="forum" element={<ForumAdmin />} />
              <Route path="activity-logs" element={<ActivityLogs />} />
              <Route path="user-bans" element={<UserBanManagement />} />
              <Route path="scheduled" element={<ScheduledActions />} />
            </Route>

            {/* Auth Routes */}
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

            {/* Test Routes */}
            <Route path="/test-database" element={<TestDatabase />} />

            {/* Catch All */}
            <Route path="*" element={<NotFound />} />
            </Routes>
          </LanguageProvider>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
