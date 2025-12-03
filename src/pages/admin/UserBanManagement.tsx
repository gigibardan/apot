import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Ban, ShieldOff, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import Breadcrumbs from "@/components/admin/Breadcrumbs";

interface UserBan {
  id: string;
  user_id: string;
  reason: string;
  ban_type: 'ban' | 'suspend';
  banned_at: string;
  expires_at: string | null;
  is_active: boolean;
  notes: string;
  profiles?: {
    full_name: string;
    email: string;
  };
  banned_by_profile?: {
    full_name: string;
  };
}

export default function UserBanManagement() {
  const [bans, setBans] = useState<UserBan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [banType, setBanType] = useState<'ban' | 'suspend'>('suspend');
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadBans();
  }, []);

  async function loadBans() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_bans')
        .select(`
          *,
          profiles!user_bans_user_id_fkey (full_name, email),
          banned_by_profile:profiles!user_bans_banned_by_fkey (full_name)
        `)
        .eq('is_active', true)
        .order('banned_at', { ascending: false });

      if (error) throw error;
      setBans(data || []);
    } catch (error) {
      console.error("Error loading bans:", error);
      toast.error("Eroare la încărcarea ban-urilor");
    } finally {
      setLoading(false);
    }
  }

  async function createBan() {
    if (!selectedUserEmail || !reason.trim()) {
      toast.error("Completează toate câmpurile obligatorii");
      return;
    }

    if (banType === 'suspend' && !expiresAt) {
      toast.error("Selectează data de expirare pentru suspend");
      return;
    }

    try {
      setSubmitting(true);
      
      // Find user by email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', selectedUserEmail.trim())
        .single();

      if (profileError || !profile) {
        toast.error("User cu acest email nu a fost găsit");
        setSubmitting(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from('user_bans').insert({
        user_id: profile.id,
        banned_by: user?.id,
        ban_type: banType,
        reason: reason.trim(),
        notes: notes.trim() || null,
        expires_at: banType === 'suspend' ? expiresAt : null,
        is_active: true
      });

      if (error) throw error;

      toast.success(`User ${banType === 'ban' ? 'banned' : 'suspended'} cu succes!`);
      setDialogOpen(false);
      resetForm();
      loadBans();
    } catch (error) {
      console.error("Error creating ban:", error);
      toast.error("Eroare la crearea ban-ului");
    } finally {
      setSubmitting(false);
    }
  }

  async function removeBan(banId: string) {
    try {
      const { error } = await supabase
        .from('user_bans')
        .update({ is_active: false })
        .eq('id', banId);

      if (error) throw error;

      toast.success("Ban ridicat cu succes!");
      loadBans();
    } catch (error) {
      console.error("Error removing ban:", error);
      toast.error("Eroare la ridicarea ban-ului");
    }
  }

  function resetForm() {
    setSelectedUserEmail("");
    setBanType('suspend');
    setReason("");
    setNotes("");
    setExpiresAt("");
  }

  const activeBans = bans.filter(b => b.ban_type === 'ban');
  const activeSuspends = bans.filter(b => b.ban_type === 'suspend');

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Utilizatori" }, { label: "Ban Management" }]} />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold">User Ban Management</h2>
          <p className="text-muted-foreground">Gestionează ban-uri și suspendări</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Ban className="mr-2 h-4 w-4" />
              Ban/Suspend User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ban/Suspend User</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="userEmail">Email User *</Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={selectedUserEmail}
                  onChange={(e) => setSelectedUserEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <Label htmlFor="banType">Tip *</Label>
                <Select value={banType} onValueChange={(v: 'ban' | 'suspend') => setBanType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ban">Permanent Ban</SelectItem>
                    <SelectItem value="suspend">Temporary Suspend</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {banType === 'suspend' && (
                <div>
                  <Label htmlFor="expiresAt">Expiră la *</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="reason">Motiv *</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Motivul ban-ului..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="notes">Note admin (opțional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Note suplimentare..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Anulează
                </Button>
                <Button onClick={createBan} disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {banType === 'ban' ? 'Ban User' : 'Suspend User'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bans</CardTitle>
            <Ban className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBans.length}</div>
            <p className="text-xs text-muted-foreground">Permanent bans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Suspends</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSuspends.length}</div>
            <p className="text-xs text-muted-foreground">Temporary suspensions</p>
          </CardContent>
        </Card>
      </div>

      {/* Bans List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : bans.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Niciun ban activ
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bans.map((ban) => (
            <Card key={ban.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {ban.ban_type === 'ban' ? (
                        <Ban className="h-4 w-4 text-destructive" />
                      ) : (
                        <ShieldOff className="h-4 w-4 text-warning" />
                      )}
                      <p className="font-medium">
                        {ban.profiles?.full_name || 'Unknown User'}
                      </p>
                      <Badge variant={ban.ban_type === 'ban' ? 'destructive' : 'secondary'}>
                        {ban.ban_type === 'ban' ? 'Permanent Ban' : 'Suspended'}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-1">
                      {ban.profiles?.email}
                    </p>

                    <p className="text-sm mb-2">
                      <strong>Motiv:</strong> {ban.reason}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        Banned: {format(new Date(ban.banned_at), 'dd MMM yyyy, HH:mm')}
                      </span>
                      {ban.expires_at && (
                        <span>
                          Expiră: {format(new Date(ban.expires_at), 'dd MMM yyyy, HH:mm')}
                        </span>
                      )}
                      <span>
                        De către: {ban.banned_by_profile?.full_name || 'Unknown'}
                      </span>
                    </div>

                    {ban.notes && (
                      <p className="text-sm text-muted-foreground mt-2">
                        <strong>Note:</strong> {ban.notes}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeBan(ban.id)}
                  >
                    Ridică Ban
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
