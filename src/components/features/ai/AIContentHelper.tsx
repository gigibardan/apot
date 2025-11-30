import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AIAnalysis {
  tags: string[];
  keywords: string[];
  suggested_types: string[];
  quality_score: number;
  improvements: string[];
  meta_description: string;
}

interface AIContentHelperProps {
  title: string;
  description: string;
  content?: string;
  onApplyTags?: (tags: string[]) => void;
  onApplyKeywords?: (keywords: string[]) => void;
  onApplyMetaDescription?: (desc: string) => void;
}

export function AIContentHelper({
  title,
  description,
  content,
  onApplyTags,
  onApplyKeywords,
  onApplyMetaDescription,
}: AIContentHelperProps) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeContent = async () => {
    if (!title || !description) {
      toast.error("Title și description sunt obligatorii");
      return;
    }

    try {
      setIsAnalyzing(true);
      const { data, error } = await supabase.functions.invoke("analyze-content", {
        body: { title, description, content },
      });

      if (error) throw error;

      setAnalysis(data as AIAnalysis);
      toast.success("Analiză completată!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Eroare la analizarea conținutului");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Content Helper
          </CardTitle>
          <Button
            onClick={analyzeContent}
            disabled={isAnalyzing}
            size="sm"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analizez...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analizează
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!analysis && !isAnalyzing && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Click "Analizează" pentru sugestii AI
          </p>
        )}

        {analysis && (
          <>
            {/* Quality Score */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="font-semibold">Quality Score</span>
              </div>
              <span className={`text-2xl font-bold ${getQualityColor(analysis.quality_score)}`}>
                {analysis.quality_score}/100
              </span>
            </div>

            {/* Tags */}
            {analysis.tags.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Taguri sugerate</label>
                  {onApplyTags && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onApplyTags(analysis.tags)}
                    >
                      Aplică
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Keywords */}
            {analysis.keywords.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Cuvinte cheie SEO</label>
                  {onApplyKeywords && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onApplyKeywords(analysis.keywords)}
                    >
                      Aplică
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywords.slice(0, 10).map((kw, idx) => (
                    <Badge key={idx} variant="outline">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Meta Description */}
            {analysis.meta_description && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Meta Description</label>
                  {onApplyMetaDescription && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onApplyMetaDescription(analysis.meta_description)}
                    >
                      Aplică
                    </Button>
                  )}
                </div>
                <p className="text-sm bg-muted p-3 rounded-md">
                  {analysis.meta_description}
                </p>
              </div>
            )}

            {/* Improvements */}
            {analysis.improvements.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Sugestii de îmbunătățire
                </label>
                <ul className="space-y-2">
                  {analysis.improvements.map((imp, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                      <span>•</span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
