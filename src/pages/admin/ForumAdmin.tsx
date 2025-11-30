import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Flag, Eye, Ban, CheckCircle, XCircle, Pin, Lock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";
import type { ForumPost, ForumReply, ForumReport, ForumCategory } from "@/types/forum";

export default function ForumAdmin() {
  const [selectedTab, setSelectedTab] = useState("reports");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; type: 'post' | 'reply' | null }>({
    open: false,
    id: '',
    type: null
  });
  const queryClient = useQueryClient();

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

  // Fetch flagged posts
  const { data: flaggedPosts = [] } = useQuery({
    queryKey: ['admin-forum-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          category:forum_categories(name),
          author:profiles!forum_posts_user_id_fkey(full_name)
        `)
        .or('status.eq.spam,status.eq.deleted')
        .order('updated_at', { ascending: false });
      
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
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-forum-posts'] });
      toast.success('Status actualizat cu succes');
    }
  });

  // Toggle pin mutation
  const togglePinMutation = useMutation({
    mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) => {
      const { error } = await supabase
        .from('forum_posts')
        .update({ pinned })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-forum-posts'] });
      toast.success('Post actualizat cu succes');
    }
  });

  // Toggle lock mutation
  const toggleLockMutation = useMutation({
    mutationFn: async ({ id, locked }: { id: string; locked: boolean }) => {
      const { error } = await supabase
        .from('forum_posts')
        .update({ locked })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-forum-posts'] });
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
      queryClient.invalidateQueries({ queryKey: ['admin-forum-posts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-forum-reports'] });
      toast.success('Șters cu succes');
      setDeleteDialog({ open: false, id: '', type: null });
    }
  });

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Administrare Forum</h1>
        <p className="text-muted-foreground">
          Gestionează rapoarte, moderează conținut și administrează categorii
        </p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="reports">
            <Flag className="h-4 w-4 mr-2" />
            Rapoarte
            {reports.filter(r => r.status === 'pending').length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {reports.filter(r => r.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="posts">
            <Eye className="h-4 w-4 mr-2" />
            Posturi
          </TabsTrigger>
          <TabsTrigger value="categories">
            <CheckCircle className="h-4 w-4 mr-2" />
            Categorii
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rapoarte de Conținut</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestionare Posturi</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titlu</TableHead>
                    <TableHead>Autor</TableHead>
                    <TableHead>Categorie</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Acțiuni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flaggedPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{post.title}</div>
                          <div className="flex gap-2 mt-1">
                            {post.pinned && <Badge variant="default"><Pin className="h-3 w-3" /></Badge>}
                            {post.locked && <Badge variant="secondary"><Lock className="h-3 w-3" /></Badge>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{post.author?.full_name || 'Anonim'}</TableCell>
                      <TableCell>{post.category?.name}</TableCell>
                      <TableCell>
                        <Badge variant={
                          post.status === 'active' ? 'default' :
                          post.status === 'spam' ? 'destructive' : 'secondary'
                        } className={
                          post.status === 'active' ? 'bg-green-600' : ''
                        }>
                          {post.status === 'active' ? 'Activ' :
                           post.status === 'spam' ? 'Spam' : 'Șters'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {post.status !== 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updatePostStatusMutation.mutate({ id: post.id, status: 'active' })}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Activează
                            </Button>
                          )}
                          {post.status === 'active' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => togglePinMutation.mutate({ id: post.id, pinned: !post.pinned })}
                              >
                                <Pin className="h-4 w-4 mr-1" />
                                {post.pinned ? 'Desprinde' : 'Fixează'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleLockMutation.mutate({ id: post.id, locked: !post.locked })}
                              >
                                <Lock className="h-4 w-4 mr-1" />
                                {post.locked ? 'Deblochează' : 'Blochează'}
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updatePostStatusMutation.mutate({ id: post.id, status: 'spam' })}
                          >
                            <Ban className="h-4 w-4 mr-1" />
                            Spam
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteDialog({ open: true, id: post.id, type: 'post' })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmare ștergere</AlertDialogTitle>
            <AlertDialogDescription>
              Ești sigur că vrei să ștergi acest {deleteDialog.type === 'post' ? 'post' : 'răspuns'}? Această acțiune nu poate fi anulată.
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
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
