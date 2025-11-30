import { useState } from "react";
import { Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SchedulePublishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: "objective" | "blog_article";
  entityId: string;
  currentScheduledFor?: string | null;
}

export function SchedulePublishModal({
  open,
  onOpenChange,
  entityType,
  entityId,
  currentScheduledFor,
}: SchedulePublishModalProps) {
  const [scheduledFor, setScheduledFor] = useState(
    currentScheduledFor
      ? new Date(currentScheduledFor).toISOString().slice(0, 16)
      : ""
  );
  const [saving, setSaving] = useState(false);

  async function handleSchedule() {
    if (!scheduledFor) {
      toast.error("Te rog selectează data și ora");
      return;
    }

    const scheduledDate = new Date(scheduledFor);
    if (scheduledDate <= new Date()) {
      toast.error("Data trebuie să fie în viitor");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("scheduled_actions").insert({
        entity_type: entityType,
        entity_id: entityId,
        action_type: "publish",
        scheduled_for: scheduledDate.toISOString(),
        status: "pending",
      });

      if (error) throw error;

      toast.success("Publicare programată cu succes!");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error scheduling publish:", error);
      toast.error("Eroare la programarea publicării");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Programează Publicarea</DialogTitle>
          <DialogDescription>
            Selectează data și ora când vrei să fie publicat automat conținutul.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="scheduled-date">Data și Ora Publicării</Label>
            <div className="relative">
              <Input
                id="scheduled-date"
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="pl-10"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              Conținutul va fi publicat automat la această dată și oră.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Anulează
          </Button>
          <Button onClick={handleSchedule} disabled={saving}>
            {saving ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Se programează...
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Programează
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
