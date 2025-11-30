import { useMemo } from "react";
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface SEOHelperProps {
  title: string;
  metaTitle: string;
  metaDescription: string;
  content: string;
  slug: string;
  featuredImage?: string;
  typesCount: number;
}

export function SEOHelper({
  title,
  metaTitle,
  metaDescription,
  content,
  slug,
  featuredImage,
  typesCount
}: SEOHelperProps) {
  const seoScore = useMemo(() => {
    let score = 0;
    const checks = [];

    // Title checks
    if (metaTitle && metaTitle.length >= 50 && metaTitle.length <= 60) {
      score += 15;
      checks.push({ label: "Titlu meta optimal (50-60 caractere)", status: "success" });
    } else if (metaTitle && metaTitle.length > 0) {
      score += 8;
      checks.push({ label: "Titlu meta prezent", status: "warning" });
    } else {
      checks.push({ label: "Titlu meta lipsă", status: "error" });
    }

    // Description checks
    if (metaDescription && metaDescription.length >= 150 && metaDescription.length <= 160) {
      score += 15;
      checks.push({ label: "Descriere meta optimală (150-160 caractere)", status: "success" });
    } else if (metaDescription && metaDescription.length > 0) {
      score += 8;
      checks.push({ label: "Descriere meta prezentă", status: "warning" });
    } else {
      checks.push({ label: "Descriere meta lipsă", status: "error" });
    }

    // Keyword in title
    const titleLower = title.toLowerCase();
    if (metaTitle && metaTitle.toLowerCase().includes(titleLower)) {
      score += 15;
      checks.push({ label: "Keyword în titlu meta", status: "success" });
    } else {
      checks.push({ label: "Keyword nu este în titlu meta", status: "warning" });
    }

    // Keyword in description
    if (metaDescription && metaDescription.toLowerCase().includes(titleLower)) {
      score += 15;
      checks.push({ label: "Keyword în descriere meta", status: "success" });
    } else {
      checks.push({ label: "Keyword nu este în descriere meta", status: "warning" });
    }

    // Featured image
    if (featuredImage) {
      score += 10;
      checks.push({ label: "Imagine featured prezentă", status: "success" });
    } else {
      checks.push({ label: "Imagine featured lipsă", status: "error" });
    }

    // Slug quality
    if (slug && !slug.match(/[^a-z0-9-]/)) {
      score += 10;
      checks.push({ label: "Slug SEO-friendly", status: "success" });
    } else {
      checks.push({ label: "Slug conține caractere speciale", status: "warning" });
    }

    // Types
    if (typesCount > 0) {
      score += 10;
      checks.push({ label: "Are tipuri asociate", status: "success" });
    } else {
      checks.push({ label: "Fără tipuri asociate", status: "warning" });
    }

    // Content length
    const wordCount = content.split(/\s+/).length;
    if (wordCount >= 300) {
      score += 10;
      checks.push({ label: `Conținut suficient (${wordCount} cuvinte)`, status: "success" });
    } else if (wordCount > 0) {
      checks.push({ label: `Conținut scurt (${wordCount} cuvinte)`, status: "warning" });
    } else {
      checks.push({ label: "Fără conținut", status: "error" });
    }

    return { score, checks };
  }, [title, metaTitle, metaDescription, content, slug, featuredImage, typesCount]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-destructive";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 50) return "bg-yellow-100";
    return "bg-destructive/10";
  };

  const getCharacterColor = (length: number, min: number, max: number) => {
    if (length === 0) return "text-muted-foreground";
    if (length >= min && length <= max) return "text-green-600";
    if (length >= min - 10 && length <= max + 10) return "text-yellow-600";
    return "text-destructive";
  };

  return (
    <div className="space-y-6">
      {/* SEO Score */}
      <Card>
        <CardHeader>
          <CardTitle>Scor SEO</CardTitle>
          <CardDescription>
            Evaluare automată a optimizării pentru motoarele de căutare
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-4xl font-bold ${getScoreColor(seoScore.score)}`}>
                {seoScore.score}/100
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {seoScore.score >= 80 && "Excelent! Gata de publicare"}
                {seoScore.score >= 50 && seoScore.score < 80 && "Bun, dar poate fi îmbunătățit"}
                {seoScore.score < 50 && "Necesită îmbunătățiri"}
              </p>
            </div>
            <div className={`w-24 h-24 rounded-full flex items-center justify-center ${getScoreBgColor(seoScore.score)}`}>
              <span className={`text-2xl font-bold ${getScoreColor(seoScore.score)}`}>
                {seoScore.score}
              </span>
            </div>
          </div>
          <Progress value={seoScore.score} className="h-2" />
        </CardContent>
      </Card>

      {/* Character Counters */}
      <Card>
        <CardHeader>
          <CardTitle>Contoare Caractere</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Titlu Meta</span>
            <span className={`text-sm font-mono ${getCharacterColor(metaTitle.length, 50, 60)}`}>
              {metaTitle.length}/60
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Descriere Meta</span>
            <span className={`text-sm font-mono ${getCharacterColor(metaDescription.length, 150, 160)}`}>
              {metaDescription.length}/160
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Checklist SEO</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {seoScore.checks.map((check, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                {check.status === "success" && (
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                )}
                {check.status === "warning" && (
                  <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                )}
                {check.status === "error" && (
                  <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                )}
                <span className={
                  check.status === "error" ? "text-destructive" :
                  check.status === "warning" ? "text-yellow-600" :
                  "text-green-600"
                }>
                  {check.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Google Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Previzualizare Google</CardTitle>
          <CardDescription>
            Așa va apărea în rezultatele de căutare
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-muted/30">
            <div className="text-sm text-green-700 mb-1">
              apot.ro › obiective › {slug || "slug-aici"}
            </div>
            <div className="text-blue-600 text-lg font-medium mb-1 hover:underline cursor-pointer">
              {metaTitle || title || "Titlu lipsă"}
            </div>
            <div className="text-sm text-muted-foreground">
              {metaDescription || "Descriere meta lipsă"}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
