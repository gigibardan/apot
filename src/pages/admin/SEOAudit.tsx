import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Search, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import Breadcrumbs from "@/components/admin/Breadcrumbs";

interface AuditIssue {
  entity_type: string;
  entity_id: string;
  entity_title: string;
  issue_type: string;
  severity: "critical" | "warning" | "info";
  description: string;
}

export default function SEOAudit() {
  const [scanning, setScanning] = useState(false);
  const [issues, setIssues] = useState<AuditIssue[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    warning: 0,
    info: 0,
    score: 0,
  });

  async function runAudit() {
    setScanning(true);
    setIssues([]);
    
    try {
      toast.info("Se scanează conținutul...");
      
      const foundIssues: AuditIssue[] = [];

      // Check Objectives
      const { data: objectives } = await supabase
        .from("objectives")
        .select("id, title, meta_title, meta_description, excerpt, description, featured_image")
        .eq("published", true);

      for (const obj of objectives || []) {
        // Missing meta title
        if (!obj.meta_title || obj.meta_title.length < 10) {
          foundIssues.push({
            entity_type: "objective",
            entity_id: obj.id,
            entity_title: obj.title,
            issue_type: "missing_meta_title",
            severity: "critical",
            description: "Meta Title lipsește sau e prea scurt (min 10 caractere)",
          });
        }

        // Meta title too long
        if (obj.meta_title && obj.meta_title.length > 60) {
          foundIssues.push({
            entity_type: "objective",
            entity_id: obj.id,
            entity_title: obj.title,
            issue_type: "meta_title_too_long",
            severity: "warning",
            description: `Meta Title prea lung (${obj.meta_title.length} caractere, max 60)`,
          });
        }

        // Missing meta description
        if (!obj.meta_description || obj.meta_description.length < 50) {
          foundIssues.push({
            entity_type: "objective",
            entity_id: obj.id,
            entity_title: obj.title,
            issue_type: "missing_meta_description",
            severity: "critical",
            description: "Meta Description lipsește sau e prea scurtă (min 50 caractere)",
          });
        }

        // Meta description too long
        if (obj.meta_description && obj.meta_description.length > 160) {
          foundIssues.push({
            entity_type: "objective",
            entity_id: obj.id,
            entity_title: obj.title,
            issue_type: "meta_description_too_long",
            severity: "warning",
            description: `Meta Description prea lungă (${obj.meta_description.length} caractere, max 160)`,
          });
        }

        // Missing featured image
        if (!obj.featured_image) {
          foundIssues.push({
            entity_type: "objective",
            entity_id: obj.id,
            entity_title: obj.title,
            issue_type: "missing_featured_image",
            severity: "warning",
            description: "Imagine principală lipsește",
          });
        }

        // Thin content
        const contentLength = (obj.description || "").replace(/<[^>]*>/g, "").length;
        if (contentLength < 300) {
          foundIssues.push({
            entity_type: "objective",
            entity_id: obj.id,
            entity_title: obj.title,
            issue_type: "thin_content",
            severity: "warning",
            description: `Conținut prea scurt (${contentLength} caractere, recomandat min 300)`,
          });
        }
      }

      // Check Blog Articles
      const { data: articles } = await supabase
        .from("blog_articles")
        .select("id, title, meta_title, meta_description, excerpt, content, featured_image")
        .eq("published", true);

      for (const article of articles || []) {
        // Similar checks for articles
        if (!article.meta_title || article.meta_title.length < 10) {
          foundIssues.push({
            entity_type: "blog_article",
            entity_id: article.id,
            entity_title: article.title,
            issue_type: "missing_meta_title",
            severity: "critical",
            description: "Meta Title lipsește sau e prea scurt",
          });
        }

        if (!article.meta_description || article.meta_description.length < 50) {
          foundIssues.push({
            entity_type: "blog_article",
            entity_id: article.id,
            entity_title: article.title,
            issue_type: "missing_meta_description",
            severity: "critical",
            description: "Meta Description lipsește sau e prea scurtă",
          });
        }

        if (!article.featured_image) {
          foundIssues.push({
            entity_type: "blog_article",
            entity_id: article.id,
            entity_title: article.title,
            issue_type: "missing_featured_image",
            severity: "warning",
            description: "Imagine principală lipsește",
          });
        }
      }

      // Calculate stats
      const critical = foundIssues.filter((i) => i.severity === "critical").length;
      const warning = foundIssues.filter((i) => i.severity === "warning").length;
      const info = foundIssues.filter((i) => i.severity === "info").length;
      
      const totalItems = (objectives?.length || 0) + (articles?.length || 0);
      const maxPossibleIssues = totalItems * 5; // Assume 5 checks per item
      const score = Math.max(0, Math.round(((maxPossibleIssues - foundIssues.length) / maxPossibleIssues) * 100));

      setStats({
        total: foundIssues.length,
        critical,
        warning,
        info,
        score,
      });

      setIssues(foundIssues);
      toast.success(`Audit complet! Găsite ${foundIssues.length} probleme.`);

    } catch (error: any) {
      console.error("Error running audit:", error);
      toast.error("Eroare la scanare");
    } finally {
      setScanning(false);
    }
  }

  function getSeverityIcon(severity: string) {
    switch (severity) {
      case "critical":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
    }
  }

  function getSeverityBadge(severity: string) {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">Critic</Badge>;
      case "warning":
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700">Warning</Badge>;
      default:
        return <Badge variant="outline">Info</Badge>;
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "SEO Audit" }]} />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold">SEO Audit</h2>
          <p className="text-muted-foreground">
            Scanează toate paginile pentru probleme SEO
          </p>
        </div>
        <Button onClick={runAudit} disabled={scanning}>
          {scanning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Se scanează...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Rulează Audit
            </>
          )}
        </Button>
      </div>

      {/* Overall Score */}
      {issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scor General SEO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-5xl font-bold">{stats.score}%</div>
              <Progress value={stats.score} className="flex-1" />
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total Probleme</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">{stats.critical}</div>
                <div className="text-xs text-muted-foreground">Critice</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.warning}</div>
                <div className="text-xs text-muted-foreground">Warnings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.info}</div>
                <div className="text-xs text-muted-foreground">Info</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Issues List */}
      {issues.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Probleme Găsite</h3>
          
          {["critical", "warning", "info"].map((severity) => {
            const severityIssues = issues.filter((i) => i.severity === severity);
            if (severityIssues.length === 0) return null;

            return (
              <div key={severity} className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  {getSeverityIcon(severity)}
                  {severity === "critical" ? "Probleme Critice" : severity === "warning" ? "Warnings" : "Info"}
                  ({severityIssues.length})
                </h4>
                
                {severityIssues.map((issue, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getSeverityBadge(issue.severity)}
                            <Badge variant="outline">{issue.entity_type}</Badge>
                            <span className="text-sm font-medium">{issue.entity_title}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {issue.description}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const route = issue.entity_type === "objective" 
                              ? `/admin/obiective/editeaza/${issue.entity_id}`
                              : `/admin/blog/editeaza/${issue.entity_id}`;
                            window.open(route, "_blank");
                          }}
                        >
                          Editează
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {!scanning && issues.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Rulează un audit pentru a vedea rezultatele
          </CardContent>
        </Card>
      )}
    </div>
  );
}
