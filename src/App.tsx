import { Suspense, lazy } from "react";
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
import { RouteScrollToTop } from "@/components/shared/RouteScrollToTop";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

// Layouts - Keep these eager loaded for fast initial render
import PublicLayout from "@/components/layout/PublicLayout";
import AdminLayout from "@/components/layout/AdminLayout";

// Critical pages - Eager load for fast initial navigation
import HomePage from "@/pages/HomePage";
import ObjectivesPage from "@/pages/ObjectivesPage";
import ObjectiveSingle from "@/pages/ObjectiveSingle";
import NotFound from "@/pages/NotFound";

// Auth pages - Eager load for smooth auth flow
import LoginPage from "@/pages/auth/Login";
import SignUpPage from "@/pages/auth/SignUp";
import ResetPasswordPage from "@/pages/auth/ResetPassword";

// Lazy loaded pages - Less critical, load on demand
const FavoritesPage = lazy(() => import("@/pages/FavoritesPage"));
const UserDashboard = lazy(() => import("@/pages/UserDashboard"));
const NewsletterConfirm = lazy(() => import("@/pages/NewsletterConfirm"));
const NewsletterUnsubscribe = lazy(() => import("@/pages/NewsletterUnsubscribe"));
const GuidesPage = lazy(() => import("@/pages/GuidesPage"));
const GuideSinglePage = lazy(() => import("@/pages/GuideSinglePage"));
const CircuitsPage = lazy(() => import("@/pages/CircuitsPage"));
const BlogPage = lazy(() => import("@/pages/BlogPage"));
const BlogArticle = lazy(() => import("@/pages/BlogArticle"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const ForumHomePage = lazy(() => import("@/pages/ForumHomePage"));
const ForumCategoryPage = lazy(() => import("@/pages/ForumCategoryPage"));
const ForumPostPage = lazy(() => import("@/pages/ForumPostPage"));
const UserProfile = lazy(() => import("@/pages/UserProfile"));
const ActivityFeed = lazy(() => import("@/pages/ActivityFeed"));
const Leaderboards = lazy(() => import("@/pages/Leaderboards"));
const TravelJournals = lazy(() => import("@/pages/TravelJournals"));
const CreateJournal = lazy(() => import("@/pages/CreateJournal"));
const JournalSingle = lazy(() => import("@/pages/JournalSingle"));
const PhotoContests = lazy(() => import("@/pages/PhotoContests"));
const ContestSingle = lazy(() => import("@/pages/ContestSingle"));
const ContestTerms = lazy(() => import("@/pages/ContestTerms"));
const CommunityChallenges = lazy(() => import("@/pages/CommunityChallenges"));
const SuggestObjective = lazy(() => import("@/pages/SuggestObjective"));
const PrivacyPolicyPage = lazy(() => import("@/pages/PrivacyPolicyPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const CookiePolicyPage = lazy(() => import("@/pages/CookiePolicyPage"));
const AuthorizedGuidesPublicPage = lazy(() => import("@/pages/AuthorizedGuidesPublicPage"));
const AuthorizedGuideSinglePage = lazy(() => import("@/pages/AuthorizedGuideSinglePage"));
const TestDatabase = lazy(() => import("@/pages/TestDatabase"));

// Admin pages - All lazy loaded
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const ObjectivesAdmin = lazy(() => import("@/pages/admin/ObjectivesAdmin"));
const ObjectiveForm = lazy(() => import("@/pages/admin/ObjectiveForm"));
const GuidesAdmin = lazy(() => import("@/pages/admin/GuidesAdmin"));
const GuideForm = lazy(() => import("@/pages/admin/GuideForm"));
const AuthorizedGuidesAdmin = lazy(() => import("@/pages/admin/AuthorizedGuidesAdmin"));
const ReviewsAdmin = lazy(() => import("@/pages/admin/ReviewsAdmin"));
const ObjectiveReviewsAdmin = lazy(() => import("@/pages/admin/ObjectiveReviewsAdmin"));
const GuideReviewsAdmin = lazy(() => import("@/pages/admin/GuideReviewsAdmin"));
const BlogAdmin = lazy(() => import("@/pages/admin/BlogAdmin"));
const BlogArticleForm = lazy(() => import("@/pages/admin/BlogArticleForm"));
const CircuitsAdmin = lazy(() => import("@/pages/admin/CircuitsAdmin"));
const CircuitForm = lazy(() => import("@/pages/admin/CircuitForm"));
const MediaLibrary = lazy(() => import("@/pages/admin/MediaLibrary"));
const Settings = lazy(() => import("@/pages/admin/Settings"));
const UsersPage = lazy(() => import("@/pages/admin/Users"));
const BulkImport = lazy(() => import("@/pages/admin/BulkImport"));
const Analytics = lazy(() => import("@/pages/admin/Analytics"));
const Templates = lazy(() => import("@/pages/admin/Templates"));
const NewsletterAdmin = lazy(() => import("@/pages/admin/NewsletterAdmin"));
const ContactMessagesAdmin = lazy(() => import("@/pages/admin/ContactMessagesAdmin"));
const ForumAdmin = lazy(() => import("@/pages/admin/ForumAdmin"));
const SuggestionsAdmin = lazy(() => import("@/pages/admin/SuggestionsAdmin"));
const ContestsAdmin = lazy(() => import("@/pages/admin/ContestsAdmin"));
const ContestSubmissionsAdmin = lazy(() => import("@/pages/admin/ContestSubmissionsAdmin"));
const ChallengesAdmin = lazy(() => import("@/pages/admin/ChallengesAdmin"));
const ActivityLogs = lazy(() => import("@/pages/admin/ActivityLogs"));
const UserBanManagement = lazy(() => import("@/pages/admin/UserBanManagement"));
const ScheduledActions = lazy(() => import("@/pages/admin/ScheduledActions"));
const ContentRevisions = lazy(() => import("@/pages/admin/ContentRevisions"));
const SEOAudit = lazy(() => import("@/pages/admin/SEOAudit"));

// Lazy loaded components
const AIChatbot = lazy(() => import("@/components/features/ai/AIChatbot").then(m => ({ default: m.AIChatbot })));
const CookieConsentBanner = lazy(() => import("@/components/features/gdpr/CookieConsentBanner").then(m => ({ default: m.CookieConsentBanner })));

const queryClient = new QueryClient();

// Page loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <LoadingSpinner size="lg" />
  </div>
);

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
              <RouteScrollToTop />
              <AnalyticsTracker />
              <Suspense fallback={null}>
                <AIChatbot />
                <CookieConsentBanner />
              </Suspense>
              <LanguageProvider>
                <Routes>
                  {/* Public Routes - with optional language prefix */}
                  <Route path="/:lang?" element={<PublicLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="obiective" element={<ObjectivesPage />} />
                    <Route path="obiective/:slug" element={<ObjectiveSingle />} />
                    <Route path="favorite" element={<Suspense fallback={<PageLoader />}><FavoritesPage /></Suspense>} />
                    <Route path="dashboard" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><UserDashboard /></Suspense></ProtectedRoute>} />
                    <Route path="newsletter/confirmare" element={<Suspense fallback={<PageLoader />}><NewsletterConfirm /></Suspense>} />
                    <Route path="newsletter/dezabonare" element={<Suspense fallback={<PageLoader />}><NewsletterUnsubscribe /></Suspense>} />
                    <Route path="ghizi" element={<Suspense fallback={<PageLoader />}><GuidesPage /></Suspense>} />
                    <Route path="ghid/:slug" element={<Suspense fallback={<PageLoader />}><GuideSinglePage /></Suspense>} />
                    <Route path="circuite" element={<Suspense fallback={<PageLoader />}><CircuitsPage /></Suspense>} />
                    <Route path="blog" element={<Suspense fallback={<PageLoader />}><BlogPage /></Suspense>} />
                    <Route path="blog/:slug" element={<Suspense fallback={<PageLoader />}><BlogArticle /></Suspense>} />
                    <Route path="despre" element={<Suspense fallback={<PageLoader />}><AboutPage /></Suspense>} />
                    <Route path="contact" element={<Suspense fallback={<PageLoader />}><ContactPage /></Suspense>} />
                    <Route path="forum" element={<Suspense fallback={<PageLoader />}><ForumHomePage /></Suspense>} />
                    <Route path="forum/:categorySlug" element={<Suspense fallback={<PageLoader />}><ForumCategoryPage /></Suspense>} />
                    <Route path="forum/:categorySlug/:postSlug" element={<Suspense fallback={<PageLoader />}><ForumPostPage /></Suspense>} />
                    <Route path="user/:username" element={<Suspense fallback={<PageLoader />}><UserProfile /></Suspense>} />
                    <Route path="profil/:username" element={<Suspense fallback={<PageLoader />}><UserProfile /></Suspense>} />
                    <Route path="feed" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><ActivityFeed /></Suspense></ProtectedRoute>} />
                    <Route path="leaderboards" element={<Suspense fallback={<PageLoader />}><Leaderboards /></Suspense>} />
                    <Route path="journals" element={<Suspense fallback={<PageLoader />}><TravelJournals /></Suspense>} />
                    <Route path="journals/new" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><CreateJournal /></Suspense></ProtectedRoute>} />
                    <Route path="journals/:slug" element={<Suspense fallback={<PageLoader />}><JournalSingle /></Suspense>} />
                    <Route path="contests" element={<Suspense fallback={<PageLoader />}><PhotoContests /></Suspense>} />
                    <Route path="contests/terms" element={<Suspense fallback={<PageLoader />}><ContestTerms /></Suspense>} />
                    <Route path="contests/:slug" element={<Suspense fallback={<PageLoader />}><ContestSingle /></Suspense>} />
                    <Route path="challenges" element={<Suspense fallback={<PageLoader />}><CommunityChallenges /></Suspense>} />
                    <Route path="suggest-objective" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><SuggestObjective /></Suspense></ProtectedRoute>} />
                    <Route path="politica-confidentialitate" element={<Suspense fallback={<PageLoader />}><PrivacyPolicyPage /></Suspense>} />
                    <Route path="termeni-conditii" element={<Suspense fallback={<PageLoader />}><TermsPage /></Suspense>} />
                    <Route path="cookies" element={<Suspense fallback={<PageLoader />}><CookiePolicyPage /></Suspense>} />
                    <Route path="ghizi-autorizati" element={<Suspense fallback={<PageLoader />}><AuthorizedGuidesPublicPage /></Suspense>} />
                    <Route path="ghid-autorizat/:slug" element={<Suspense fallback={<PageLoader />}><AuthorizedGuideSinglePage /></Suspense>} />
                  </Route>

                  {/* Admin Routes - Protected (Admin only) */}
                  <Route path="/admin" element={<ProtectedRoute requireRole="admin"><AdminLayout /></ProtectedRoute>}>
                    <Route index element={<Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>} />
                    <Route path="analytics" element={<Suspense fallback={<PageLoader />}><Analytics /></Suspense>} />
                    <Route path="obiective" element={<Suspense fallback={<PageLoader />}><ObjectivesAdmin /></Suspense>} />
                    <Route path="obiective/nou" element={<Suspense fallback={<PageLoader />}><ObjectiveForm /></Suspense>} />
                    <Route path="obiective/:id" element={<Suspense fallback={<PageLoader />}><ObjectiveForm /></Suspense>} />
                    <Route path="ghizi" element={<Suspense fallback={<PageLoader />}><GuidesAdmin /></Suspense>} />
                    <Route path="ghizi/nou" element={<Suspense fallback={<PageLoader />}><GuideForm /></Suspense>} />
                    <Route path="ghizi/:id/edit" element={<Suspense fallback={<PageLoader />}><GuideForm /></Suspense>} />
                    <Route path="ghizi-autorizati" element={<Suspense fallback={<PageLoader />}><AuthorizedGuidesAdmin /></Suspense>} />
                    <Route path="recenzii" element={<Suspense fallback={<PageLoader />}><ReviewsAdmin /></Suspense>} />
                    <Route path="recenzii-ghizi" element={<Suspense fallback={<PageLoader />}><GuideReviewsAdmin /></Suspense>} />
                    <Route path="recenzii-obiective" element={<Suspense fallback={<PageLoader />}><ObjectiveReviewsAdmin /></Suspense>} />
                    <Route path="blog" element={<Suspense fallback={<PageLoader />}><BlogAdmin /></Suspense>} />
                    <Route path="blog/nou" element={<Suspense fallback={<PageLoader />}><BlogArticleForm /></Suspense>} />
                    <Route path="blog/:id" element={<Suspense fallback={<PageLoader />}><BlogArticleForm /></Suspense>} />
                    <Route path="circuite" element={<Suspense fallback={<PageLoader />}><CircuitsAdmin /></Suspense>} />
                    <Route path="circuite/nou" element={<Suspense fallback={<PageLoader />}><CircuitForm /></Suspense>} />
                    <Route path="circuite/:id" element={<Suspense fallback={<PageLoader />}><CircuitForm /></Suspense>} />
                    <Route path="media" element={<Suspense fallback={<PageLoader />}><MediaLibrary /></Suspense>} />
                    <Route path="newsletter" element={<Suspense fallback={<PageLoader />}><NewsletterAdmin /></Suspense>} />
                    <Route path="mesaje-contact" element={<Suspense fallback={<PageLoader />}><ContactMessagesAdmin /></Suspense>} />
                    <Route path="setari" element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />
                    <Route path="utilizatori" element={<ProtectedRoute requireRole="admin"><Suspense fallback={<PageLoader />}><UsersPage /></Suspense></ProtectedRoute>} />
                    <Route path="import" element={<Suspense fallback={<PageLoader />}><BulkImport /></Suspense>} />
                    <Route path="templates" element={<Suspense fallback={<PageLoader />}><Templates /></Suspense>} />
                    <Route path="suggestions" element={<Suspense fallback={<PageLoader />}><SuggestionsAdmin /></Suspense>} />
                    <Route path="contests" element={<Suspense fallback={<PageLoader />}><ContestsAdmin /></Suspense>} />
                    <Route path="contests/:id/submissions" element={<Suspense fallback={<PageLoader />}><ContestSubmissionsAdmin /></Suspense>} />
                    <Route path="challenges" element={<Suspense fallback={<PageLoader />}><ChallengesAdmin /></Suspense>} />
                    <Route path="forum" element={<Suspense fallback={<PageLoader />}><ForumAdmin /></Suspense>} />
                    <Route path="activity-logs" element={<Suspense fallback={<PageLoader />}><ActivityLogs /></Suspense>} />
                    <Route path="user-bans" element={<Suspense fallback={<PageLoader />}><UserBanManagement /></Suspense>} />
                    <Route path="scheduled" element={<Suspense fallback={<PageLoader />}><ScheduledActions /></Suspense>} />
                    <Route path="content-revisions" element={<Suspense fallback={<PageLoader />}><ContentRevisions /></Suspense>} />
                    <Route path="seo-audit" element={<Suspense fallback={<PageLoader />}><SEOAudit /></Suspense>} />
                  </Route>

                  {/* Auth Routes */}
                  <Route path="/auth/login" element={<LoginPage />} />
                  <Route path="/auth/signup" element={<SignUpPage />} />
                  <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

                  {/* Test Routes */}
                  <Route path="/test-database" element={<Suspense fallback={<PageLoader />}><TestDatabase /></Suspense>} />

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
