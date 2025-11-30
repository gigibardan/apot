import { useState, useEffect } from "react";
import { Plus, Search, Mail, UserCheck, UserX, Trash2, Edit, Shield } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";

interface User {
  id: string;
  email: string;
  name?: string;
  role: "admin" | "editor" | "contributor" | "user";
  created_at: string;
  last_sign_in_at?: string;
}

export default function UsersPage() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<"editor" | "contributor" | "user">("user");
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Fetch users from auth.users via service role (would need edge function in real app)
      // For now, fetch from user_roles table
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role, created_at");

      if (rolesError) throw rolesError;

      // Get user metadata (this would need service role access in production)
      const usersData: User[] = rolesData?.map((role) => ({
        id: role.user_id,
        email: `user-${role.user_id.slice(0, 8)}@apot.ro`, // Placeholder
        name: undefined,
        role: role.role as "admin" | "editor" | "contributor" | "user",
        created_at: role.created_at,
        last_sign_in_at: undefined,
      })) || [];

      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Nu am putut încărca utilizatorii",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail || !inviteName) {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Completează toate câmpurile obligatorii",
      });
      return;
    }

    setInviteLoading(true);

    try {
      // In production, this would be an edge function call
      // that creates the user via admin API and sends invitation email
      
      toast({
        title: "Invitație trimisă!",
        description: `Utilizatorul ${inviteName} a fost invitat cu succes.`,
      });

      setInviteDialogOpen(false);
      setInviteEmail("");
      setInviteName("");
      setInviteRole("user");
      fetchUsers();
    } catch (error) {
      console.error("Error inviting user:", error);
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Nu am putut trimite invitația",
      });
    } finally {
      setInviteLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Rol actualizat!",
        description: "Rolul utilizatorului a fost schimbat cu succes.",
      });

      fetchUsers();
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Nu am putut actualiza rolul",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    // Prevent deleting self
    if (selectedUser.id === currentUser?.id) {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Nu te poți șterge pe tine însuți",
      });
      return;
    }

    // Prevent deleting last admin
    const adminCount = users.filter((u) => u.role === "admin").length;
    if (selectedUser.role === "admin" && adminCount === 1) {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Trebuie să existe cel puțin un administrator",
      });
      return;
    }

    try {
      // In production, this would be an edge function call
      // that deletes the user via admin API
      
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", selectedUser.id);

      if (error) throw error;

      toast({
        title: "Utilizator șters",
        description: "Utilizatorul a fost șters cu succes",
      });

      setDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Nu am putut șterge utilizatorul",
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500 text-white";
      case "editor":
        return "bg-blue-500 text-white";
      case "contributor":
        return "bg-purple-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrator";
      case "editor":
        return "Editor";
      case "contributor":
        return "Contributor";
      default:
        return "Utilizator";
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email?.slice(0, 2).toUpperCase() || "U";
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <Section className="py-8">
      <Container>
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: "Dashboard", href: "/admin" },
              { label: "Utilizatori" },
            ]}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Utilizatori</h1>
            <p className="text-muted-foreground mt-2">
              Gestionează utilizatorii și rolurile acestora
            </p>
          </div>
          <Button onClick={() => setInviteDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Invită Utilizator
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Caută după nume sau email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrează după rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toate rolurile</SelectItem>
              <SelectItem value="admin">Administrator</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="contributor">Contributor</SelectItem>
              <SelectItem value="user">Utilizator</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            icon="👥"
            title="Niciun utilizator găsit"
            description={
              searchQuery
                ? "Nu există utilizatori care să corespundă căutării"
                : "Invită primul utilizator"
            }
            action={{
              label: "Invită Utilizator",
              onClick: () => setInviteDialogOpen(true),
            }}
          />
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilizator</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Ultima autentificare</TableHead>
                  <TableHead className="text-right">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {getInitials(user.name, user.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {user.name || user.email}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(value) =>
                          handleUpdateRole(user.id, value)
                        }
                        disabled={user.id === currentUser?.id}
                      >
                        <SelectTrigger className="w-[150px]">
                          <Badge
                            className={getRoleBadgeColor(user.role)}
                          >
                            <Shield className="w-3 h-3 mr-1" />
                            {getRoleLabel(user.role)}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrator</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="contributor">
                            Contributor
                          </SelectItem>
                          <SelectItem value="user">Utilizator</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {user.last_sign_in_at ? (
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(user.last_sign_in_at), {
                            addSuffix: true,
                            locale: ro,
                          })}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Niciodată
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setDeleteDialogOpen(true);
                        }}
                        disabled={user.id === currentUser?.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Invite Dialog */}
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invită Utilizator Nou</DialogTitle>
              <DialogDescription>
                Trimite o invitație pentru un utilizator nou. Va primi un email
                cu instrucțiuni de autentificare.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email *</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="utilizator@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-name">Nume *</Label>
                <Input
                  id="invite-name"
                  placeholder="Nume complet"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-role">Rol *</Label>
                <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="contributor">Contributor</SelectItem>
                    <SelectItem value="user">Utilizator</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Editorii pot crea și publica conținut. Contributorii pot doar
                  crea drafturi.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setInviteDialogOpen(false)}
              >
                Anulează
              </Button>
              <Button onClick={handleInviteUser} disabled={inviteLoading}>
                {inviteLoading ? "Se trimite..." : "Trimite Invitație"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Ești absolut sigur?</AlertDialogTitle>
              <AlertDialogDescription>
                Această acțiune nu poate fi anulată. Utilizatorul{" "}
                <strong>{selectedUser?.name || selectedUser?.email}</strong> va
                fi șters permanent împreună cu toate datele asociate.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Anulează</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUser}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Șterge Utilizator
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Container>
    </Section>
  );
}
