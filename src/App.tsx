import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Layouts
import PublicLayout from "@/components/layout/PublicLayout";
import AdminLayout from "@/components/layout/AdminLayout";

// Pages
import HomePage from "@/pages/HomePage";
import ObjectivesPage from "@/pages/ObjectivesPage";
import ObjectiveSingle from "@/pages/ObjectiveSingle";
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
import BlogAdmin from "@/pages/admin/BlogAdmin";
import BlogArticleForm from "@/pages/admin/BlogArticleForm";
import CircuitsAdmin from "@/pages/admin/CircuitsAdmin";
import CircuitForm from "@/pages/admin/CircuitForm";
import MediaLibrary from "@/pages/admin/MediaLibrary";
import Settings from "@/pages/admin/Settings";
import UsersPage from "@/pages/admin/Users";
import BulkImport from "@/pages/admin/BulkImport";
import Templates from "@/pages/admin/Templates";
import LoginPage from "@/pages/auth/Login";
import ResetPasswordPage from "@/pages/auth/ResetPassword";
import NotFound from "@/pages/NotFound";
import TestDatabase from "@/pages/TestDatabase";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="obiective" element={<ObjectivesPage />} />
              <Route path="obiective/:slug" element={<ObjectiveSingle />} />
              <Route path="ghizi" element={<GuidesPage />} />
              <Route path="ghid/:slug" element={<GuideSinglePage />} />
              <Route path="blog" element={<BlogPage />} />
              <Route path="blog/:slug" element={<BlogArticle />} />
              <Route path="despre" element={<AboutPage />} />
              <Route path="contact" element={<ContactPage />} />
            </Route>

            {/* Admin Routes - Protected */}
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="obiective" element={<ObjectivesAdmin />} />
              <Route path="obiective/nou" element={<ObjectiveForm />} />
              <Route path="obiective/:id" element={<ObjectiveForm />} />
              <Route path="ghizi" element={<GuidesAdmin />} />
              <Route path="ghizi/nou" element={<GuideForm />} />
              <Route path="ghizi/:id/edit" element={<GuideForm />} />
              <Route path="ghizi-autorizati" element={<AuthorizedGuidesAdmin />} />
              <Route path="recenzii" element={<ReviewsAdmin />} />
              <Route path="blog" element={<BlogAdmin />} />
              <Route path="blog/nou" element={<BlogArticleForm />} />
              <Route path="blog/:id" element={<BlogArticleForm />} />
              <Route path="circuite" element={<CircuitsAdmin />} />
              <Route path="circuite/nou" element={<CircuitForm />} />
              <Route path="circuite/:id" element={<CircuitForm />} />
              <Route path="media" element={<MediaLibrary />} />
              <Route path="setari" element={<Settings />} />
              <Route path="utilizatori" element={<ProtectedRoute requireRole="admin"><UsersPage /></ProtectedRoute>} />
              <Route path="import" element={<BulkImport />} />
              <Route path="templates" element={<Templates />} />
            </Route>

            {/* Auth Routes */}
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

            {/* Test Routes */}
            <Route path="/test-database" element={<TestDatabase />} />

            {/* Catch All */}
            <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
