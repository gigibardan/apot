import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, MessageSquare, Activity } from "lucide-react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";

interface DashboardActivityProps {
  userId: string;
}

interface ActivityItem {
  id: string;
  type: "favorite" | "review" | "message";
  title: string;
  description: string;
  timestamp: string;
  icon: any;
  color: string;
}

export function DashboardActivity({ userId }: DashboardActivityProps) {
  // Fetch all activity data
  const { data: activities, isLoading } = useQuery({
    queryKey: ["user-activity", userId],
    queryFn: async () => {
      const items: ActivityItem[] = [];

      // Fetch recent favorites
      const { data: favorites } = await supabase
        .from("user_favorites")
        .select(
          `
          id,
          created_at,
          objective:objectives (
            title
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (favorites) {
        favorites.forEach((fav) => {
          const objective = fav.objective as any;
          items.push({
            id: fav.id,
            type: "favorite",
            title: "Obiectiv adăugat la favorite",
            description: objective?.title || "Obiectiv",
            timestamp: fav.created_at,
            icon: Heart,
            color: "text-red-500",
          });
        });
      }

      // Fetch recent objective reviews
      const { data: objReviews } = await supabase
        .from("reviews")
        .select(
          `
          id,
          created_at,
          rating,
          objective:objectives (
            title
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (objReviews) {
        objReviews.forEach((review) => {
          const objective = review.objective as any;
          items.push({
            id: review.id,
            type: "review",
            title: `Recenzie scrisă (${review.rating}★)`,
            description: objective?.title || "Obiectiv",
            timestamp: review.created_at,
            icon: Star,
            color: "text-yellow-500",
          });
        });
      }

      // Fetch recent guide reviews
      const { data: guideReviews } = await supabase
        .from("guide_reviews")
        .select(
          `
          id,
          created_at,
          rating,
          guide:guides (
            full_name
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (guideReviews) {
        guideReviews.forEach((review) => {
          const guide = review.guide as any;
          items.push({
            id: `guide-${review.id}`,
            type: "review",
            title: `Recenzie ghid (${review.rating}★)`,
            description: guide?.full_name || "Ghid",
            timestamp: review.created_at,
            icon: Star,
            color: "text-yellow-500",
          });
        });
      }

      // Fetch recent contact messages
      const { data: messages } = await supabase
        .from("contact_messages")
        .select("id, created_at, subject")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (messages) {
        messages.forEach((msg) => {
          items.push({
            id: `msg-${msg.id}`,
            type: "message",
            title: "Mesaj trimis",
            description: msg.subject,
            timestamp: msg.created_at,
            icon: MessageSquare,
            color: "text-blue-500",
          });
        });
      }

      // Sort all activities by timestamp
      return items.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon={<Activity className="w-12 h-12" />}
            title="Nicio activitate"
            description="Nu ai nicio activitate înregistrată încă"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activitatea Mea</CardTitle>
        <CardDescription>Istoric complet al activităților tale</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            const isLast = index === activities.length - 1;

            return (
              <div key={activity.id} className="relative">
                {/* Timeline line */}
                {!isLast && (
                  <div className="absolute left-5 top-12 bottom-0 w-px bg-border" />
                )}

                {/* Activity item */}
                <div className="flex gap-4">
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full bg-background border-2 border-border flex items-center justify-center ${activity.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-8">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold">{activity.title}</p>
                      <Badge variant="outline" className="text-xs">
                        {format(new Date(activity.timestamp), "d MMM", { locale: ro })}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(activity.timestamp), "HH:mm", { locale: ro })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
