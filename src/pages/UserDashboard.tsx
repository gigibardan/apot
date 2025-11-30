import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SEO } from "@/components/seo/SEO";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardProfile } from "@/components/features/dashboard/DashboardProfile";
import { DashboardStats } from "@/components/features/dashboard/DashboardStats";
import { DashboardFavorites } from "@/components/features/dashboard/DashboardFavorites";
import { DashboardReviews } from "@/components/features/dashboard/DashboardReviews";
import { DashboardMessages } from "@/components/features/dashboard/DashboardMessages";
import { DashboardActivity } from "@/components/features/dashboard/DashboardActivity";
import { User, Heart, Star, MessageSquare, Activity, Settings } from "lucide-react";

/**
 * User Dashboard
 * Central hub for user profile, favorites, reviews, messages, and activity
 */
export default function UserDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <>
      <SEO
        title="Tabloul Meu de Bord"
        description="Gestionează-ți profilul, favoritele, recenziile și mesajele"
        noindex
      />

      <Section className="py-8">
        <Container>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
              Tabloul Meu de Bord
            </h1>
            <p className="text-muted-foreground">
              Bine ai venit, {user?.email}
            </p>
          </div>

          {/* Dashboard Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 gap-2">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Prezentare</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profil</span>
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Favorite</span>
              </TabsTrigger>
              <TabsTrigger value="reviews" className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span className="hidden sm:inline">Recenzii</span>
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Mesaje</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Activitate</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <DashboardStats userId={user!.id} />
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Favorite Recente</CardTitle>
                    <CardDescription>
                      Ultimele obiective adăugate la favorite
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DashboardFavorites userId={user!.id} limit={3} compact />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recenzii Recente</CardTitle>
                    <CardDescription>
                      Ultimele tale recenzii
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DashboardReviews userId={user!.id} limit={3} compact />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <DashboardProfile userId={user!.id} />
            </TabsContent>

            {/* Favorites Tab */}
            <TabsContent value="favorites">
              <DashboardFavorites userId={user!.id} />
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews">
              <DashboardReviews userId={user!.id} />
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages">
              <DashboardMessages userId={user!.id} />
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity">
              <DashboardActivity userId={user!.id} />
            </TabsContent>
          </Tabs>
        </Container>
      </Section>
    </>
  );
}
