import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Mail, Phone, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";

interface DashboardMessagesProps {
  userId: string;
}

export function DashboardMessages({ userId }: DashboardMessagesProps) {
  const [activeTab, setActiveTab] = useState<"contact" | "bookings" | "inquiries">("contact");

  // Fetch contact messages
  const { data: contactMessages, isLoading: contactLoading } = useQuery({
    queryKey: ["user-contact-messages", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch guide booking requests
  const { data: bookingRequests, isLoading: bookingsLoading } = useQuery({
    queryKey: ["user-booking-requests", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guide_booking_requests")
        .select(
          `
          *,
          guide:guides (
            id,
            full_name,
            slug
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch objective inquiries
  const { data: objectiveInquiries, isLoading: inquiriesLoading } = useQuery({
    queryKey: ["user-objective-inquiries", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("objective_inquiries")
        .select(
          `
          *,
          objective:objectives (
            id,
            title,
            slug
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const isLoading = contactLoading || bookingsLoading || inquiriesLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  const totalMessages =
    (contactMessages?.length || 0) +
    (bookingRequests?.length || 0) +
    (objectiveInquiries?.length || 0);

  if (totalMessages === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon={<MessageSquare className="w-12 h-12" />}
            title="Niciun mesaj"
            description="Nu ai trimis încă niciun mesaj"
          />
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      new: { variant: "default", label: "Nou" },
      pending: { variant: "secondary", label: "În așteptare" },
      read: { variant: "outline", label: "Citit" },
      replied: { variant: "default", label: "Răspuns" },
      completed: { variant: "default", label: "Finalizat" },
      cancelled: { variant: "destructive", label: "Anulat" },
    };

    const config = variants[status] || { variant: "secondary", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mesajele Mele</CardTitle>
        <CardDescription>{totalMessages} mesaje trimise</CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="contact">
              Contact ({contactMessages?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="bookings">
              Rezervări ({bookingRequests?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="inquiries">
              Întrebări ({objectiveInquiries?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Contact Messages */}
          <TabsContent value="contact" className="mt-6 space-y-4">
            {!contactMessages || contactMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Niciun mesaj de contact
              </p>
            ) : (
              contactMessages.map((message) => (
                <div key={message.id} className="p-4 rounded-lg border">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground mt-1" />
                      <div>
                        <p className="font-semibold">{message.subject}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(message.created_at), "d MMM yyyy, HH:mm", {
                            locale: ro,
                          })}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(message.status)}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {message.message}
                  </p>
                </div>
              ))
            )}
          </TabsContent>

          {/* Booking Requests */}
          <TabsContent value="bookings" className="mt-6 space-y-4">
            {!bookingRequests || bookingRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nicio cerere de rezervare
              </p>
            ) : (
              bookingRequests.map((booking) => {
                const guide = booking.guide as any;
                return (
                  <div key={booking.id} className="p-4 rounded-lg border">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-muted-foreground mt-1" />
                        <div>
                          <p className="font-semibold">Rezervare cu {guide?.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Data preferată:{" "}
                            {format(new Date(booking.preferred_date), "d MMM yyyy", {
                              locale: ro,
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Trimis:{" "}
                            {format(new Date(booking.created_at), "d MMM yyyy, HH:mm", {
                              locale: ro,
                            })}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="text-muted-foreground">Număr persoane:</span>{" "}
                        {booking.number_of_people}
                      </p>
                      {booking.duration_days && (
                        <p>
                          <span className="text-muted-foreground">Durata:</span>{" "}
                          {booking.duration_days} zile
                        </p>
                      )}
                      {booking.destinations && booking.destinations.length > 0 && (
                        <p>
                          <span className="text-muted-foreground">Destinații:</span>{" "}
                          {booking.destinations.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>

          {/* Objective Inquiries */}
          <TabsContent value="inquiries" className="mt-6 space-y-4">
            {!objectiveInquiries || objectiveInquiries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nicio întrebare despre obiective
              </p>
            ) : (
              objectiveInquiries.map((inquiry) => {
                const objective = inquiry.objective as any;
                return (
                  <div key={inquiry.id} className="p-4 rounded-lg border">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-start gap-3">
                        <MessageSquare className="w-5 h-5 text-muted-foreground mt-1" />
                        <div>
                          <p className="font-semibold">Întrebare despre {objective?.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(inquiry.created_at), "d MMM yyyy, HH:mm", {
                              locale: ro,
                            })}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(inquiry.status)}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {inquiry.message}
                    </p>
                    {inquiry.visit_date && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Data vizitei planificate:{" "}
                        {format(new Date(inquiry.visit_date), "d MMM yyyy", { locale: ro })}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
