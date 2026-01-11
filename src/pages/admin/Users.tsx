import { useState, useEffect } from "react";
import { Plus, Search, UserCheck, UserX, Trash2, Shield, Key, Ban, Users as UsersIcon, UserPlus, Activity, AlertCircle, Clock, ChevronDown, ArrowUpDown } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow, format } from "date-fns";
import { ro } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UserBanManagement from "./UserBanManagement";

interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role: "admin" | "editor" | "contributor" | "user";
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
  status: "active" | "banned" | "suspended";
  ban_expires_at?: string | null;
  ban_reason?: string | null;
}

interface UserStats {
  totalUsers: number;
  roleStats: Record<string, number>;
  bannedCount: number;
  suspendedCount: number;
  newUsers: number;
  activeUsers: number;
}

type SortField = "name" | "email" | "role" | "created_at" | "last_sign_in_at" | "status";
type SortDirection = "asc" | "desc";

export default function UsersPage() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stats, setStats] = useState<UserStats | null>(null);
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  
  // Dialog states
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Invite form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "editor" | "contributor" | "user">("user");
  const [inviteLoading, setInviteLoading] = useState(false);
  
  // Create user form
  const [createEmail, setCreateEmail] = useState("");
  const [createName, setCreateName] = useState("");
  const [createRole, setCreateRole] = useState<"admin" | "editor" | "contributor" | "user">("user");
  const [createPassword, setCreatePassword] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  
  // Reset password form
  const [newPassword, setNewPassword] = useState("");
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  
  // Ban form
  const [banType, setBanType] = useState<"ban" | "suspend">("suspend");
  const [banReason, setBanReason] = useState("");
  const [banNotes, setBanNotes] = useState("");
  const [banExpiresAt, setBanExpiresAt] = useState("");
  const [banLoading, setBanLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-users`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const { users: usersData } = await response.json();
      setUsers(usersData || []);
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

  const fetchStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-user-stats`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-user`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: inviteEmail,
            name: inviteName,
            role: inviteRole,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to invite user");
      }
      
      toast({
        title: "Invitație trimisă!",
        description: `Utilizatorul ${inviteName} a fost invitat. Va primi un email pentru setarea parolei.`,
      });

      setInviteDialogOpen(false);
      setInviteEmail("");
      setInviteName("");
      setInviteRole("user");
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error("Error inviting user:", error);
      toast({
        variant: "destructive",
        title: "Eroare",
        description: error instanceof Error ? error.message : "Nu am putut trimite invitația",
      });
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!createEmail || !createName || !createPassword) {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Completează toate câmpurile obligatorii",
      });
      return;
    }

    if (createPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Parola trebuie să aibă minimum 6 caractere",
      });
      return;
    }

    setCreateLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: createEmail,
            name: createName,
            role: createRole,
            password: createPassword,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create user");
      }
      
      toast({
        title: "Utilizator creat!",
        description: `Utilizatorul ${createName} a fost creat cu succes și poate să se autentifice imediat.`,
      });

      setCreateDialogOpen(false);
      setCreateEmail("");
      setCreateName("");
      setCreateRole("user");
      setCreatePassword("");
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        variant: "destructive",
        title: "Eroare",
        description: error instanceof Error ? error.message : "Nu am putut crea utilizatorul",
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      // Check if changing role from admin when they're the last one
      const targetUser = users.find(u => u.id === userId);
      if (targetUser?.role === 'admin' && newRole !== 'admin') {
        const adminCount = users.filter(u => u.role === 'admin').length;
        if (adminCount <= 1) {
          toast({
            variant: "destructive",
            title: "Eroare",
            description: "Trebuie să existe cel puțin un administrator",
          });
          return;
        }
      }

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

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Introdu o parolă nouă",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Parola trebuie să aibă minimum 6 caractere",
      });
      return;
    }

    setResetPasswordLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reset-user-password`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: selectedUser.id,
            newPassword,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reset password");
      }

      toast({
        title: "Parolă resetată!",
        description: `Parola utilizatorului ${selectedUser.name || selectedUser.email} a fost resetată cu succes.`,
      });

      setResetPasswordDialogOpen(false);
      setSelectedUser(null);
      setNewPassword("");
    } catch (error) {
      console.error("Error resetting password:", error);
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Nu am putut reseta parola",
      });
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const handleBanUser = async () => {
    if (!selectedUser || !banReason) {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Completează motivul ban-ului",
      });
      return;
    }

    if (banType === 'suspend' && !banExpiresAt) {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Selectează data de expirare pentru suspendare",
      });
      return;
    }

    setBanLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-user-ban`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "ban",
            userId: selectedUser.id,
            banType,
            reason: banReason,
            notes: banNotes,
            expiresAt: banType === 'suspend' ? banExpiresAt : null,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to ban user");
      }

      toast({
        title: banType === 'ban' ? "Utilizator banat!" : "Utilizator suspendat!",
        description: `${selectedUser.name || selectedUser.email} a fost ${banType === 'ban' ? 'banat permanent' : 'suspendat temporar'}.`,
      });

      setBanDialogOpen(false);
      setSelectedUser(null);
      setBanReason("");
      setBanNotes("");
      setBanExpiresAt("");
      setBanType("suspend");
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error("Error banning user:", error);
      toast({
        variant: "destructive",
        title: "Eroare",
        description: error instanceof Error ? error.message : "Nu am putut bana utilizatorul",
      });
    } finally {
      setBanLoading(false);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-user-ban`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "unban",
            userId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to unban user");
      }

      toast({
        title: "Ban ridicat!",
        description: "Utilizatorul poate accesa din nou platforma.",
      });

      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error("Error unbanning user:", error);
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Nu am putut ridica ban-ul",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    if (selectedUser.id === currentUser?.id) {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Nu te poți șterge pe tine însuți",
      });
      return;
    }

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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: selectedUser.id,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete user");
      }

      toast({
        title: "Utilizator șters",
        description: "Utilizatorul a fost șters cu succes",
      });

      setDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        variant: "destructive",
        title: "Eroare",
        description: error instanceof Error ? error.message : "Nu am putut șterge utilizatorul",
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "editor":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "contributor":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const getStatusBadge = (user: User) => {
    switch (user.status) {
      case "banned":
        return (
          <Badge variant="destructive" className="gap-1">
            <Ban className="w-3 h-3" />
            Banat
          </Badge>
        );
      case "suspended":
        return (
          <Badge variant="secondary" className="gap-1 bg-amber-500/10 text-amber-600 border-amber-500/20">
            <Clock className="w-3 h-3" />
            Suspendat
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-600 border-green-500/20">
            <UserCheck className="w-3 h-3" />
            Activ
          </Badge>
        );
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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedUsers = users
    .filter((user) => {
      const matchesSearch =
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name":
          comparison = (a.name || a.email).localeCompare(b.name || b.email);
          break;
        case "email":
          comparison = a.email.localeCompare(b.email);
          break;
        case "role":
          comparison = a.role.localeCompare(b.role);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "created_at":
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case "last_sign_in_at":
          const aTime = a.last_sign_in_at ? new Date(a.last_sign_in_at).getTime() : 0;
          const bTime = b.last_sign_in_at ? new Date(b.last_sign_in_at).getTime() : 0;
          comparison = aTime - bTime;
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className={`w-3 h-3 ${sortField === field ? 'text-primary' : 'text-muted-foreground'}`} />
      </div>
    </TableHead>
  );

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
            <h1 className="text-3xl font-display font-bold">Gestionare Utilizatori</h1>
            <p className="text-muted-foreground mt-2">
              Vizualizare, gestionare, ban și creare utilizatori
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Utilizatori</CardTitle>
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilizatori Activi</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeUsers}</div>
                <p className="text-xs text-muted-foreground">Ultimele 30 zile</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilizatori Noi</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.newUsers}</div>
                <p className="text-xs text-muted-foreground">Ultimele 30 zile</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ban/Suspend</CardTitle>
                <Ban className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.bannedCount + stats.suspendedCount}</div>
                <p className="text-xs text-muted-foreground">{stats.bannedCount} ban, {stats.suspendedCount} suspend</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Listă Utilizatori</TabsTrigger>
            <TabsTrigger value="bans">Ban Management</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex gap-4 flex-1">
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
                  <SelectTrigger className="w-[180px]">
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
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrează după status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toate statusurile</SelectItem>
                    <SelectItem value="active">Activ</SelectItem>
                    <SelectItem value="banned">Banat</SelectItem>
                    <SelectItem value="suspended">Suspendat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Adaugă Utilizator
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setCreateDialogOpen(true)}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Creează Utilizator
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setInviteDialogOpen(true)}>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Invită Utilizator
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Users Table */}
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : filteredAndSortedUsers.length === 0 ? (
              <EmptyState
                icon="👥"
                title="Niciun utilizator găsit"
                description={
                  searchQuery || roleFilter !== "all" || statusFilter !== "all"
                    ? "Nu există utilizatori care să corespundă căutării"
                    : "Creează primul utilizator"
                }
                action={{
                  label: "Creează Utilizator",
                  onClick: () => setCreateDialogOpen(true),
                }}
              />
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableHeader field="name">Utilizator</SortableHeader>
                      <SortableHeader field="role">Rol</SortableHeader>
                      <SortableHeader field="status">Status</SortableHeader>
                      <SortableHeader field="last_sign_in_at">Ultima autentificare</SortableHeader>
                      <SortableHeader field="created_at">Înregistrat</SortableHeader>
                      <TableHead className="text-right">Acțiuni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              {user.avatar_url && <AvatarImage src={user.avatar_url} />}
                              <AvatarFallback className="bg-primary/10 text-primary">
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
                                variant="outline"
                                className={getRoleBadgeColor(user.role)}
                              >
                                <Shield className="w-3 h-3 mr-1" />
                                {getRoleLabel(user.role)}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Administrator</SelectItem>
                              <SelectItem value="editor">Editor</SelectItem>
                              <SelectItem value="contributor">Contributor</SelectItem>
                              <SelectItem value="user">Utilizator</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {getStatusBadge(user)}
                            {user.status === 'suspended' && user.ban_expires_at && (
                              <span className="text-xs text-muted-foreground">
                                Expiră: {format(new Date(user.ban_expires_at), 'dd MMM yyyy')}
                              </span>
                            )}
                          </div>
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
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(user.created_at), 'dd MMM yyyy')}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                Acțiuni
                                <ChevronDown className="w-4 h-4 ml-1" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setResetPasswordDialogOpen(true);
                                }}
                                disabled={user.id === currentUser?.id}
                              >
                                <Key className="w-4 h-4 mr-2" />
                                Resetează Parola
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {user.status === 'active' ? (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setBanDialogOpen(true);
                                  }}
                                  disabled={user.id === currentUser?.id}
                                  className="text-amber-600"
                                >
                                  <Ban className="w-4 h-4 mr-2" />
                                  Ban/Suspend
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => handleUnbanUser(user.id)}
                                  className="text-green-600"
                                >
                                  <UserCheck className="w-4 h-4 mr-2" />
                                  Ridică Ban
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setDeleteDialogOpen(true);
                                }}
                                disabled={user.id === currentUser?.id}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Șterge Utilizator
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {/* User count */}
            {!loading && filteredAndSortedUsers.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Afișează {filteredAndSortedUsers.length} din {users.length} utilizatori
              </p>
            )}
          </TabsContent>

          <TabsContent value="bans">
            <UserBanManagement onBanChange={() => { fetchUsers(); fetchStats(); }} />
          </TabsContent>
        </Tabs>

        {/* Create User Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Creează Utilizator Nou</DialogTitle>
              <DialogDescription>
                Creează un utilizator nou cu email confirmat și parolă setată. 
                Utilizatorul poate să se autentifice imediat.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-email">Email *</Label>
                <Input
                  id="create-email"
                  type="email"
                  placeholder="utilizator@example.com"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-name">Nume *</Label>
                <Input
                  id="create-name"
                  placeholder="Nume complet"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-password">Parolă *</Label>
                <Input
                  id="create-password"
                  type="password"
                  placeholder="Minimum 6 caractere"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-role">Rol *</Label>
                <Select value={createRole} onValueChange={(value: any) => setCreateRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="contributor">Contributor</SelectItem>
                    <SelectItem value="user">Utilizator</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Administratorii au acces complet. Editorii pot crea și publica conținut. 
                  Contributorii pot doar crea drafturi.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Anulează
              </Button>
              <Button onClick={handleCreateUser} disabled={createLoading}>
                {createLoading ? "Se creează..." : "Creează Utilizator"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Invite Dialog */}
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invită Utilizator</DialogTitle>
              <DialogDescription>
                Trimite o invitație pentru un utilizator nou. Va primi un email
                cu instrucțiuni pentru setarea parolei.
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
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="contributor">Contributor</SelectItem>
                    <SelectItem value="user">Utilizator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                Anulează
              </Button>
              <Button onClick={handleInviteUser} disabled={inviteLoading}>
                {inviteLoading ? "Se trimite..." : "Trimite Invitație"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reset Password Dialog */}
        <Dialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resetează Parola</DialogTitle>
              <DialogDescription>
                Setează o parolă nouă pentru {selectedUser?.name || selectedUser?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Parolă Nouă *</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Minimum 6 caractere"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setResetPasswordDialogOpen(false);
                  setNewPassword("");
                }}
              >
                Anulează
              </Button>
              <Button onClick={handleResetPassword} disabled={resetPasswordLoading}>
                {resetPasswordLoading ? "Se resetează..." : "Resetează Parola"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Ban Dialog */}
        <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ban/Suspend Utilizator</DialogTitle>
              <DialogDescription>
                Restricționează accesul pentru {selectedUser?.name || selectedUser?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tip restricție *</Label>
                <Select value={banType} onValueChange={(v: 'ban' | 'suspend') => setBanType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ban">Permanent Ban</SelectItem>
                    <SelectItem value="suspend">Suspendare Temporară</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {banType === 'suspend' && (
                <div className="space-y-2">
                  <Label htmlFor="ban-expires">Data expirare *</Label>
                  <Input
                    id="ban-expires"
                    type="datetime-local"
                    value={banExpiresAt}
                    onChange={(e) => setBanExpiresAt(e.target.value)}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="ban-reason">Motiv *</Label>
                <Textarea
                  id="ban-reason"
                  placeholder="Descrie motivul ban-ului..."
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ban-notes">Note admin (opțional)</Label>
                <Textarea
                  id="ban-notes"
                  placeholder="Note suplimentare..."
                  value={banNotes}
                  onChange={(e) => setBanNotes(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setBanDialogOpen(false);
                setBanReason("");
                setBanNotes("");
                setBanExpiresAt("");
              }}>
                Anulează
              </Button>
              <Button 
                onClick={handleBanUser} 
                disabled={banLoading}
                variant="destructive"
              >
                {banLoading ? "Se procesează..." : (banType === 'ban' ? 'Aplică Ban' : 'Aplică Suspendare')}
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
