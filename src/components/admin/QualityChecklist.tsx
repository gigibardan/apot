import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface QualityCheck {
  label: string;
  status: "pass" | "warning" | "fail";
  required: boolean;
}

interface QualityChecklistProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublish: () => void;
  onKeepDraft: () => void;
  checks: QualityCheck[];
}

export function QualityChecklist({
  open,
  onOpenChange,
  onPublish,
  onKeepDraft,
  checks
}: QualityChecklistProps) {
  const passedCount = checks.filter(c => c.status === "pass").length;
  const totalCount = checks.length;
  const percentage = Math.round((passedCount / totalCount) * 100);
  const requiredFailed = checks.some(c => c.required && c.status === "fail");

  const getScoreColor = () => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-destructive";
  };

  const getScoreBgColor = () => {
    if (percentage >= 80) return "bg-green-100";
    if (percentage >= 60) return "bg-yellow-100";
    return "bg-destructive/10";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Verificare Calitate Conținut</DialogTitle>
          <DialogDescription>
            Asigură-te că conținutul respectă standardele de calitate înainte de publicare
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Score Overview */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div>
              <div className={`text-3xl font-bold ${getScoreColor()}`}>
                {percentage}%
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {passedCount} din {totalCount} verificări trecute
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {percentage >= 80 && "Excelent! Gata de publicare 🎉"}
                {percentage >= 60 && percentage < 80 && "Bun, dar recomandăm îmbunătățiri"}
                {percentage < 60 && "Necesită îmbunătățiri semnificative"}
              </p>
            </div>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${getScoreBgColor()}`}>
              <span className={`text-xl font-bold ${getScoreColor()}`}>
                {percentage}
              </span>
            </div>
          </div>

          <Progress value={percentage} className="h-2" />

          {/* Checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Checklist Calitate</h4>
              <div className="flex gap-2 text-xs">
                <Badge variant="outline" className="gap-1">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  Trecut
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <AlertCircle className="w-3 h-3 text-yellow-600" />
                  Avertisment
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <XCircle className="w-3 h-3 text-destructive" />
                  Eșuat
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              {checks.map((check, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-background"
                >
                  <div className="mt-0.5">
                    {check.status === "pass" && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    {check.status === "warning" && (
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    )}
                    {check.status === "fail" && (
                      <XCircle className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${
                        check.status === "fail" ? "text-destructive" :
                        check.status === "warning" ? "text-yellow-600" :
                        "text-green-600"
                      }`}>
                        {check.label}
                      </span>
                      {check.required && (
                        <Badge variant="secondary" className="text-xs">
                          Obligatoriu
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {requiredFailed && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive">
              <p className="text-sm font-medium text-destructive">
                ⚠️ Atenție: Unele câmpuri obligatorii nu sunt completate
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Recomandăm să completezi toate câmpurile obligatorii înainte de publicare.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Anulează
          </Button>
          <Button variant="secondary" onClick={onKeepDraft}>
            Păstrează ca Draft
          </Button>
          <Button onClick={onPublish} disabled={requiredFailed}>
            {requiredFailed ? "Completează Obligatoriile" : "Publică Oricum"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
