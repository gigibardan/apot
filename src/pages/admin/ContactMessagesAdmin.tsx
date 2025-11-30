import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Mail,
  MessageSquare,
  Calendar,
  Loader2,
  Eye,
  CheckCircle,
  XCircle,
  Archive,
  Trash2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  getContactMessages,
  getObjectiveInquiries,
  getGuideBookingRequests,
  getContactMessagesStats,
  getObjectiveInquiriesStats,
  getGuideBookingRequestsStats,
} from "@/lib/supabase/queries/contact";
import {
  updateContactMessageStatus,
  updateObjectiveInquiryStatus,
  updateGuideBookingStatus,
  bulkDeleteContactMessages,
} from "@/lib/supabase/mutations/contact";
import { toast } from "sonner";

type ContactMessage = any;
type ObjectiveInquiry = any;
type GuideBooking = any;

export default function ContactMessagesAdmin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("contact");
  const [loading, setLoading] = useState(true);

  // Contact Messages
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [contactStats, setContactStats] = useState<any>(null);
  const [contactFilter, setContactFilter] = useState<string>("all");

  // Objective Inquiries
  const [inquiries, setInquiries] = useState<ObjectiveInquiry[]>([]);
  const [inquiriesStats, setInquiriesStats] = useState<any>(null);
  const [inquiryFilter, setInquiryFilter] = useState<string>("all");

  // Guide Bookings
  const [bookings, setBookings] = useState<GuideBooking[]>([]);
  const [bookingsStats, setBookingsStats] = useState<any>(null);
  const [bookingFilter, setBookingFilter] = useState<string>("all");

  // Dialog
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    loadData();
  }, [contactFilter, inquiryFilter, bookingFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        contactData,
        contactStatsData,
        inquiriesData,
        inquiriesStatsData,
        bookingsData,
        bookingsStatsData,
      ] = await Promise.all([
        getContactMessages(
          contactFilter !== "all" ? contactFilter as any : undefined
        ),
        getContactMessagesStats(),
        getObjectiveInquiries(
          inquiryFilter !== "all" ? inquiryFilter as any : undefined
        ),
        getObjectiveInquiriesStats(),
        getGuideBookingRequests(
          bookingFilter !== "all" ? bookingFilter as any : undefined
        ),
        getGuideBookingRequestsStats(),
      ]);

      setContactMessages(contactData.data || []);
      setContactStats(contactStatsData);
      setInquiries(inquiriesData.data || []);
      setInquiriesStats(inquiriesStatsData);
      setBookings(bookingsData.data || []);
      setBookingsStats(bookingsStatsData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Eroare la încărcarea datelor");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (item: any, type: string) => {
    setSelectedItem({ ...item, type });
    setAdminNotes(item.admin_notes || "");
    setDialogOpen(true);
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedItem) return;

    try {
      if (selectedItem.type === "contact") {
        await updateContactMessageStatus(selectedItem.id, status as any, adminNotes);
      } else if (selectedItem.type === "inquiry") {
        await updateObjectiveInquiryStatus(selectedItem.id, status as any, adminNotes);
      } else if (selectedItem.type === "booking") {
        await updateGuideBookingStatus(selectedItem.id, status as any, adminNotes);
      }

      setDialogOpen(false);
      loadData();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      new: "default",
      pending: "default",
      read: "secondary",
      contacted: "secondary",
      replied: "outline",
      confirmed: "outline",
      archived: "secondary",
      cancelled: "destructive",
      completed: "outline",
    };

    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Mesaje Contact</h1>
          <p className="text-muted-foreground">
            Gestionează mesajele de contact, întrebările și cererile de rezervare
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="contact">
              <Mail className="w-4 h-4 mr-2" />
              Contact ({contactStats?.new || 0})
            </TabsTrigger>
            <TabsTrigger value="inquiries">
              <MessageSquare className="w-4 h-4 mr-2" />
              Întrebări ({inquiriesStats?.new || 0})
            </TabsTrigger>
            <TabsTrigger value="bookings">
              <Calendar className="w-4 h-4 mr-2" />
              Rezervări ({bookingsStats?.pending || 0})
            </TabsTrigger>
          </TabsList>

          {/* Contact Messages Tab */}
          <TabsContent value="contact" className="space-y-4">
            <div className="flex items-center gap-4">
              <Select value={contactFilter} onValueChange={setContactFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrează după status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate</SelectItem>
                  <SelectItem value="new">Noi</SelectItem>
                  <SelectItem value="read">Citite</SelectItem>
                  <SelectItem value="replied">Răspunse</SelectItem>
                  <SelectItem value="archived">Arhivate</SelectItem>
                </SelectContent>
              </Select>

              {contactStats && (
                <div className="flex gap-4 text-sm">
                  <span>Total: {contactStats.total}</span>
                  <span className="text-primary">Noi: {contactStats.new}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {contactMessages.map((message) => (
                <Card key={message.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{message.full_name}</h3>
                        {getStatusBadge(message.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {message.subject}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {message.email} {message.phone && `• ${message.phone}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(message.created_at)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(message, "contact")}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Vizualizează
                    </Button>
                  </div>
                </Card>
              ))}

              {contactMessages.length === 0 && (
                <Card className="p-8 text-center text-muted-foreground">
                  Nu există mesaje de contact
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Objective Inquiries Tab */}
          <TabsContent value="inquiries" className="space-y-4">
            <div className="flex items-center gap-4">
              <Select value={inquiryFilter} onValueChange={setInquiryFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrează după status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate</SelectItem>
                  <SelectItem value="new">Noi</SelectItem>
                  <SelectItem value="read">Citite</SelectItem>
                  <SelectItem value="replied">Răspunse</SelectItem>
                  <SelectItem value="archived">Arhivate</SelectItem>
                </SelectContent>
              </Select>

              {inquiriesStats && (
                <div className="flex gap-4 text-sm">
                  <span>Total: {inquiriesStats.total}</span>
                  <span className="text-primary">Noi: {inquiriesStats.new}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {inquiries.map((inquiry) => (
                <Card key={inquiry.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{inquiry.full_name}</h3>
                        {getStatusBadge(inquiry.status)}
                      </div>
                      {inquiry.objectives && (
                        <p className="text-sm font-medium text-primary">
                          {inquiry.objectives.title}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {inquiry.email} {inquiry.phone && `• ${inquiry.phone}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(inquiry.created_at)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(inquiry, "inquiry")}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Vizualizează
                    </Button>
                  </div>
                </Card>
              ))}

              {inquiries.length === 0 && (
                <Card className="p-8 text-center text-muted-foreground">
                  Nu există întrebări despre obiective
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Guide Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            <div className="flex items-center gap-4">
              <Select value={bookingFilter} onValueChange={setBookingFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrează după status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate</SelectItem>
                  <SelectItem value="pending">În așteptare</SelectItem>
                  <SelectItem value="contacted">Contactat</SelectItem>
                  <SelectItem value="confirmed">Confirmat</SelectItem>
                  <SelectItem value="cancelled">Anulat</SelectItem>
                  <SelectItem value="completed">Finalizat</SelectItem>
                </SelectContent>
              </Select>

              {bookingsStats && (
                <div className="flex gap-4 text-sm">
                  <span>Total: {bookingsStats.total}</span>
                  <span className="text-primary">
                    În așteptare: {bookingsStats.pending}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {bookings.map((booking) => (
                <Card key={booking.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{booking.full_name}</h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      {booking.guides && (
                        <p className="text-sm font-medium text-primary">
                          Ghid: {booking.guides.full_name}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {booking.email} • {booking.phone}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Data: {formatDate(booking.preferred_date)} •{" "}
                        {booking.number_of_people} persoane
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Creat: {formatDate(booking.created_at)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(booking, "booking")}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Vizualizează
                    </Button>
                  </div>
                </Card>
              ))}

              {bookings.length === 0 && (
                <Card className="p-8 text-center text-muted-foreground">
                  Nu există cereri de rezervare
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Details Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedItem?.type === "contact" && "Detalii mesaj contact"}
              {selectedItem?.type === "inquiry" && "Detalii întrebare"}
              {selectedItem?.type === "booking" && "Detalii rezervare"}
            </DialogTitle>
            <DialogDescription>
              Vizualizează și actualizează statusul
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Nume</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedItem.full_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedItem.email}
                  </p>
                </div>
                {selectedItem.phone && (
                  <div>
                    <p className="text-sm font-medium">Telefon</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedItem.phone}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">Status</p>
                  {getStatusBadge(selectedItem.status)}
                </div>
              </div>

              {selectedItem.subject && (
                <div>
                  <p className="text-sm font-medium">Subiect</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedItem.subject}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium mb-2">Mesaj</p>
                <div className="p-3 bg-muted rounded-lg text-sm">
                  {selectedItem.message}
                </div>
              </div>

              {selectedItem.type === "booking" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Data preferată</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(selectedItem.preferred_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Nr. persoane</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedItem.number_of_people}
                      </p>
                    </div>
                  </div>
                  {selectedItem.special_requests && (
                    <div>
                      <p className="text-sm font-medium">Cerințe speciale</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedItem.special_requests}
                      </p>
                    </div>
                  )}
                </>
              )}

              <div>
                <p className="text-sm font-medium mb-2">Notițe admin</p>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Adaugă notițe interne..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                {selectedItem.type === "contact" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus("read")}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Marchează citit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus("replied")}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Marchează răspuns
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus("archived")}
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Arhivează
                    </Button>
                  </>
                )}

                {selectedItem.type === "inquiry" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus("read")}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Marchează citit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus("replied")}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Marchează răspuns
                    </Button>
                  </>
                )}

                {selectedItem.type === "booking" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus("contacted")}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Contactat
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus("confirmed")}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirmă
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleUpdateStatus("cancelled")}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Anulează
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
  );
}
