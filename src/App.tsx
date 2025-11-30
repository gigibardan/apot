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
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import AdminDashboard from "@/pages/admin/Dashboard";
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
              <Route path="despre" element={<AboutPage />} />
              <Route path="contact" element={<ContactPage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
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
