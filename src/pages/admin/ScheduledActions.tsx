import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Clock, X, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format, isPast, isFuture } from "date-fns";
import Breadcrumbs from "@/components/admin/Breadcrumbs";

interface ScheduledAction {
  id: string;
  entity_type: string;
  entity_id: string;
  action_type: 'publish' | 'unpublish' | 'feature' | 'unfeature' | 'archive';
  scheduled_for: string;
  status: 'pending' | 'executed' | 'cancelled' | 'failed';
  executed_at: string | null;
  error_message: string | null;
  metadata: any;
  created_at: string;
}

export default function ScheduledActions() {
  const [actions, setActions] = useState<ScheduledAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'executed' | 'all'>('pending');

  useEffect(() => {
    loadActions();
  }, [filter]);

  async function loadActions() {
    try {
      setLoading(true);
      let query = supabase
        .from('scheduled_actions')
        .select('*')
        .order('scheduled_for', { ascending: true });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setActions(data || []);
    } catch (error) {
      console.error("Error loading scheduled actions:", error);
      toast.error("Eroare la încărcarea acțiunilor programate");
    } finally {
      setLoading(false);
    }
  }

  async function cancelAction(actionId: string) {
    try {
      const { error } = await supabase
        .from('scheduled_actions')
        .update({ status: 'cancelled' })
        .eq('id', actionId);

      if (error) throw error;

      toast.success("Acțiune anulată cu succes!");
      loadActions();
    } catch (error) {
      console.error("Error cancelling action:", error);
      toast.error("Eroare la anularea acțiunii");
    }
  }

  function getStatusBadge(status: string, scheduledFor: string) {
    if (status === 'executed') {
      return <Badge variant="secondary"><CheckCircle2 className="mr-1 h-3 w-3" />Executat</Badge>;
    }
    if (status === 'cancelled') {
      return <Badge variant="outline"><X className="mr-1 h-3 w-3" />Anulat</Badge>;
    }
    if (status === 'failed') {
      return <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3" />Eșuat</Badge>;
    }

    if (isPast(new Date(scheduledFor))) {
      return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />În așteptare...</Badge>;
    }

    return <Badge><Calendar className="mr-1 h-3 w-3" />Programat</Badge>;
  }

  function getActionLabel(actionType: string) {
    const labels = {
      publish: 'Publică',
      unpublish: 'Depublică',
      feature: 'Marchează ca Featured',
      unfeature: 'Scoate din Featured',
      archive: 'Arhivează'
    };
    return labels[actionType as keyof typeof labels] || actionType;
  }

  const pendingActions = actions.filter(a => a.status === 'pending');
  const executedActions = actions.filter(a => a.status === 'executed');

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Scheduled Actions" }]} />

      <div>
        <h2 className="text-3xl font-display font-bold">Scheduled Actions</h2>
        <p className="text-muted-foreground">Acțiuni programate pentru conținut</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
        >
          În așteptare ({pendingActions.length})
        </Button>
        <Button
          variant={filter === 'executed' ? 'default' : 'outline'}
          onClick={() => setFilter('executed')}
        >
          Executate ({executedActions.length})
        </Button>
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          Toate ({actions.length})
        </Button>
      </div>

      {/* Actions List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : actions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nicio acțiune programată
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {actions.map((action) => (
            <Card key={action.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(action.status, action.scheduled_for)}
                      <span className="font-medium">{getActionLabel(action.action_type)}</span>
                      <Badge variant="outline">{action.entity_type}</Badge>
                    </div>

                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>
                        <strong>Programat pentru:</strong>{' '}
                        {format(new Date(action.scheduled_for), 'dd MMM yyyy, HH:mm')}
                        {isFuture(new Date(action.scheduled_for)) && (
                          <span className="ml-2 text-primary">(în viitor)</span>
                        )}
                      </p>
                      {action.executed_at && (
                        <p>
                          <strong>Executat la:</strong>{' '}
                          {format(new Date(action.executed_at), 'dd MMM yyyy, HH:mm')}
                        </p>
                      )}
                      {action.error_message && (
                        <p className="text-destructive">
                          <strong>Eroare:</strong> {action.error_message}
                        </p>
                      )}
                    </div>
                  </div>

                  {action.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cancelAction(action.id)}
                    >
                      <X className="mr-1 h-3 w-3" />
                      Anulează
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
