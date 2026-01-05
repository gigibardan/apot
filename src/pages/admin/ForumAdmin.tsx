import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Flag, Eye, Ban, CheckCircle, XCircle, Pin, Lock, Trash2, Pencil, Search, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";
import type { ForumPost, ForumReply, ForumReport, ForumCategory } from "@/types/forum";

export default function ForumAdmin() {
  const [selectedTab, setSelectedTab] = useState("posts");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; type: 'post' | 'reply' | null }>({
    open: false,
    id: '',
    type: null
  });
  const [editDialog, setEditDialog] = useState<{ open: boolean; post: any | null }>({
    open: false,
    post: null
  });
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const queryClient = useQueryClient();

  // Fetch ALL posts
  const { data: allPosts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['admin-forum-all-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          category:forum_categories(name, slug),
          author:profiles!forum_posts_user_id_fkey(full_name, username)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as any[];
    }
  });

  // Fetch reports
  const { data: reports = [] } = useQuery({
    queryKey: ['admin-forum-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_reports')
        .select(`
          *,
          reporter:profiles!forum_reports_reporter_id_fkey(full_name),
          post:forum_posts(title, slug),
          reply:forum_replies(content)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as any[];
    }
  });

  // Fetch categories for management
  const { data: categories = [] } = useQuery({
    queryKey: ['admin-forum-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .order('order_index');
      
      if (error) throw error;
      return data as ForumCategory[];
    }
  });

  // Filter posts based on search and status
  const filteredPosts = allPosts.filter(post => {
    const matchesSearch = searchQuery === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author?.username?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || post.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Resolve report mutation
  const resolveReportMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'resolved' | 'dismissed' }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('forum_reports')
        .update({
          status,
          resolved_by: user?.id,
          resolved_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-forum-reports'] });
      toast.success('Raport actualizat cu succes');
    }
  });

  // Update post status mutation
  const updatePostStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('forum_posts')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-forum-all-posts'] });
      toast.success('Status actualizat cu succes');
    },
    onError: (error) => {
      toast.error('Eroare la actualizarea statusului');
      console.error(error);
    }
  });

  // Edit post mutation
  const editPostMutation = useMutation({
    mutationFn: async ({ id, title, content }: { id: string; title: string; content: string }) => {
      const { error } = await supabase
        .from('forum_posts')
        .update({ 
          title, 
          content,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-forum-all-posts'] });
      toast.success('Post actualizat cu succes');
      setEditDialog({ open: false, post: null });
    },
    onError: (error) => {
      toast.error('Eroare la actualizarea postului');
      console.error(error);
    }
  });

  // Toggle pin mutation
  const togglePinMutation = useMutation({
    mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) => {
      const { error } = await supabase
        .from('forum_posts')
        .update({ pinned, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-forum-all-posts'] });
      toast.success('Post actualizat cu succes');
    }
  });

  // Toggle lock mutation
  const toggleLockMutation = useMutation({
    mutationFn: async ({ id, locked }: { id: string; locked: boolean }) => {
      const { error } = await supabase
        .from('forum_posts')
        .update({ locked, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-forum-all-posts'] });
      toast.success('Post actualizat cu succes');
    }
  });

  // Delete post/reply mutation
  const deleteMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: 'post' | 'reply' }) => {
      const table = type === 'post' ? 'forum_posts' : 'forum_replies';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-forum-all-posts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-forum-reports'] });
      toast.success('Șters cu succes');
      setDeleteDialog({ open: false, id: '', type: null });
    },
    onError: (error) => {
      toast.error('Eroare la ștergere');
      console.error(error);
    }
  });

  const openEditDialog = (post: any) => {
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditDialog({ open: true, post });
  };

  const handleSaveEdit = () => {
    if (editDialog.post) {
      editPostMutation.mutate({
        id: editDialog.post.id,
        title: editTitle,
        content: editContent
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-600">Activ</Badge>;
      case 'deleted':
        return <Badge variant="secondary">Ascuns</Badge>;
      case 'spam':
        return <Badge variant="destructive">Spam</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Administrare Forum</h1>
        <p className="text-muted-foreground">
          Gestionează posturi, rapoarte și categorii
        </p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="posts">
            <Eye className="h-4 w-4 mr-2" />
            Posturi ({allPosts.length})
          </TabsTrigger>
          <TabsTrigger value="reports">
            <Flag className="h-4 w-4 mr-2" />
            Rapoarte
            {reports.filter(r => r.status === 'pending').length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {reports.filter(r => r.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="categories">
            <CheckCircle className="h-4 w-4 mr-2" />
            Categorii
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle>Toate Posturile</CardTitle>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Caută după titlu sau autor..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-full sm:w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toate</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="deleted">Ascunse</SelectItem>
                      <SelectItem value="spam">Spam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {postsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Se încarcă...</div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Nu există posturi</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">Titlu</TableHead>
                        <TableHead>Autor</TableHead>
                        <TableHead>Categorie</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Vizualizări</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="min-w-[300px]">Acțiuni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPosts.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium line-clamp-1">{post.title}</div>
                              <div className="flex gap-1 mt-1">
                                {post.pinned && <Badge variant="outline" className="text-xs"><Pin className="h-3 w-3 mr-1" />Fixat</Badge>}
                                {post.locked && <Badge variant="outline" className="text-xs"><Lock className="h-3 w-3 mr-1" />Blocat</Badge>}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {post.author?.full_name || post.author?.username || 'Anonim'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{post.category?.name}</Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(post.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {post.views_count}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(post.created_at), {
                              addSuffix: true,
                              locale: ro
                            })}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {/* Edit Button */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditDialog(post)}
                                title="Editează"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>

                              {/* Pin/Unpin */}
                              <Button
                                size="sm"
                                variant={post.pinned ? "default" : "outline"}
                                onClick={() => togglePinMutation.mutate({ id: post.id, pinned: !post.pinned })}
                                title={post.pinned ? 'Desprinde' : 'Fixează'}
                              >
                                <Pin className="h-4 w-4" />
                              </Button>

                              {/* Lock/Unlock */}
                              <Button
                                size="sm"
                                variant={post.locked ? "default" : "outline"}
                                onClick={() => toggleLockMutation.mutate({ id: post.id, locked: !post.locked })}
                                title={post.locked ? 'Deblochează' : 'Blochează'}
                              >
                                <Lock className="h-4 w-4" />
                              </Button>

                              {/* Show/Hide */}
                              {post.status === 'active' ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updatePostStatusMutation.mutate({ id: post.id, status: 'deleted' })}
                                  title="Ascunde"
                                >
                                  <EyeOff className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updatePostStatusMutation.mutate({ id: post.id, status: 'active' })}
                                  title="Activează"
                                  className="text-green-600 border-green-600 hover:bg-green-50"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}

                              {/* Mark as Spam */}
                              <Button
                                size="sm"
                                variant={post.status === 'spam' ? "destructive" : "outline"}
                                onClick={() => updatePostStatusMutation.mutate({ 
                                  id: post.id, 
                                  status: post.status === 'spam' ? 'active' : 'spam' 
                                })}
                                title={post.status === 'spam' ? 'Nu e spam' : 'Marchează spam'}
                              >
                                <Ban className="h-4 w-4" />
                              </Button>

                              {/* Delete */}
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setDeleteDialog({ open: true, id: post.id, type: 'post' })}
                                title="Șterge definitiv"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rapoarte de Conținut</CardTitle>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Nu există rapoarte</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Raportor</TableHead>
                      <TableHead>Tip</TableHead>
                      <TableHead>Motiv</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Acțiuni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>{report.reporter?.full_name || 'Anonim'}</TableCell>
                        <TableCell>
                          <Badge variant={report.post_id ? 'default' : 'secondary'}>
                            {report.post_id ? 'Post' : 'Răspuns'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{report.reason}</div>
                            {report.description && (
                              <div className="text-sm text-muted-foreground">{report.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(report.created_at), {
                            addSuffix: true,
                            locale: ro
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            report.status === 'pending' ? 'default' :
                            report.status === 'resolved' ? 'default' : 'secondary'
                          } className={
                            report.status === 'resolved' ? 'bg-green-600' : ''
                          }>
                            {report.status === 'pending' ? 'În așteptare' :
                             report.status === 'resolved' ? 'Rezolvat' : 'Respins'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {report.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => resolveReportMutation.mutate({ id: report.id, status: 'resolved' })}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Rezolvă
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => resolveReportMutation.mutate({ id: report.id, status: 'dismissed' })}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Respinge
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Categorii Forum</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nume</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Posturi</TableHead>
                    <TableHead>Ordine</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {category.color && (
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: category.color }}
                            />
                          )}
                          {category.name}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{category.slug}</TableCell>
                      <TableCell>{category.posts_count}</TableCell>
                      <TableCell>{category.order_index}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmare ștergere</AlertDialogTitle>
            <AlertDialogDescription>
              Ești sigur că vrei să ștergi definitiv acest {deleteDialog.type === 'post' ? 'post' : 'răspuns'}? 
              Această acțiune nu poate fi anulată și va șterge și toate răspunsurile asociate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteDialog.type) {
                  deleteMutation.mutate({ id: deleteDialog.id, type: deleteDialog.type });
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Șterge definitiv
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Post Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ ...editDialog, open })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editează Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Titlu</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Titlul postului"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">Conținut</Label>
              <Textarea
                id="edit-content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Conținutul postului"
                rows={10}
                className="font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, post: null })}>
              Anulează
            </Button>
            <Button onClick={handleSaveEdit} disabled={editPostMutation.isPending}>
              {editPostMutation.isPending ? 'Se salvează...' : 'Salvează'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}