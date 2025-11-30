import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Star, MessageSquare, Eye } from "lucide-react";

interface DashboardStatsProps {
  userId: string;
}

export function DashboardStats({ userId }: DashboardStatsProps) {
  // Fetch all stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats", userId],
    queryFn: async () => {
      // Fetch favorites count
      const { count: favoritesCount } = await supabase
        .from("user_favorites")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      // Fetch reviews count (objectives + guides)
      const { count: objectiveReviewsCount } = await supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      const { count: guideReviewsCount } = await supabase
        .from("guide_reviews")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      // Fetch messages count
      const { count: contactMessagesCount } = await supabase
        .from("contact_messages")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      const { count: guideBookingsCount } = await supabase
        .from("guide_booking_requests")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      const { count: objectiveInquiriesCount } = await supabase
        .from("objective_inquiries")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      const totalReviews = (objectiveReviewsCount || 0) + (guideReviewsCount || 0);
      const totalMessages =
        (contactMessagesCount || 0) +
        (guideBookingsCount || 0) +
        (objectiveInquiriesCount || 0);

      return {
        favorites: favoritesCount || 0,
        reviews: totalReviews,
        messages: totalMessages,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Favorite",
      value: stats?.favorites || 0,
      description: "Obiective salvate",
      icon: Heart,
      color: "text-red-500",
    },
    {
      title: "Recenzii",
      value: stats?.reviews || 0,
      description: "Recenzii scrise",
      icon: Star,
      color: "text-yellow-500",
    },
    {
      title: "Mesaje",
      value: stats?.messages || 0,
      description: "Mesaje trimise",
      icon: MessageSquare,
      color: "text-blue-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
