import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { HelmetProvider } from "react-helmet-async";

// Layouts
import PublicLayout from "@/components/layout/PublicLayout";
import AdminLayout from "@/components/layout/AdminLayout";

// Pages
import HomePage from "@/pages/HomePage";
import ObjectivesPage from "@/pages/ObjectivesPage";
import ObjectiveSingle from "@/pages/ObjectiveSingle";
import BlogPage from "@/pages/BlogPage";
import BlogArticle from "@/pages/BlogArticle";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import AdminDashboard from "@/pages/admin/Dashboard";
import ObjectivesAdmin from "@/pages/admin/ObjectivesAdmin";
import ObjectiveForm from "@/pages/admin/ObjectiveForm";
import BlogAdmin from "@/pages/admin/BlogAdmin";
import BlogArticleForm from "@/pages/admin/BlogArticleForm";
import CircuitsAdmin from "@/pages/admin/CircuitsAdmin";
import CircuitForm from "@/pages/admin/CircuitForm";
import MediaLibrary from "@/pages/admin/MediaLibrary";
import Settings from "@/pages/admin/Settings";
import LoginPage from "@/pages/auth/Login";
import NotFound from "@/pages/NotFound";
import TestDatabase from "@/pages/TestDatabase";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
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
              <Route path="blog" element={<BlogPage />} />
              <Route path="blog/:slug" element={<BlogArticle />} />
              <Route path="despre" element={<AboutPage />} />
              <Route path="contact" element={<ContactPage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="obiective" element={<ObjectivesAdmin />} />
              <Route path="obiective/nou" element={<ObjectiveForm />} />
              <Route path="obiective/:id" element={<ObjectiveForm />} />
              <Route path="blog" element={<BlogAdmin />} />
              <Route path="blog/nou" element={<BlogArticleForm />} />
              <Route path="blog/:id" element={<BlogArticleForm />} />
              <Route path="circuite" element={<CircuitsAdmin />} />
              <Route path="circuite/nou" element={<CircuitForm />} />
              <Route path="circuite/:id" element={<CircuitForm />} />
              <Route path="media" element={<MediaLibrary />} />
              <Route path="setari" element={<Settings />} />
            </Route>

            {/* Auth Routes */}
            <Route path="/auth/login" element={<LoginPage />} />

            {/* Test Routes */}
            <Route path="/test-database" element={<TestDatabase />} />

            {/* Catch All */}
            <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
