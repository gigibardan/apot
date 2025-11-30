import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PageViewsChart } from "@/components/admin/analytics/PageViewsChart";
import { TopContentTable } from "@/components/admin/analytics/TopContentTable";
import { ConversionChart } from "@/components/admin/analytics/ConversionChart";
import { RealTimeStats } from "@/components/admin/analytics/RealTimeStats";
import {
  getPageViewsAnalytics,
  getUserEngagementMetrics,
  getContentPerformance,
  getConversionMetrics,
  exportToCSV,
  DateRange,
} from "@/lib/supabase/queries/analytics";
import {
  BarChart3,
  Download,
  CalendarIcon,
  TrendingUp,
  Users,
  Eye,
  Heart,
  MessageSquare,
  Mail,
  Loader2,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { ro } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  
  const [loading, setLoading] = useState(true);
  const [pageViews, setPageViews] = useState<any>(null);
  const [engagement, setEngagement] = useState<any>(null);
  const [contentPerformance, setContentPerformance] = useState<any>(null);
  const [conversions, setConversions] = useState<any>(null);

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      try {
        const [viewsData, engagementData, contentData, conversionData] = await Promise.all([
          getPageViewsAnalytics(dateRange),
          getUserEngagementMetrics(dateRange),
          getContentPerformance(dateRange),
          getConversionMetrics(dateRange),
        ]);

        setPageViews(viewsData);
        setEngagement(engagementData);
        setContentPerformance(contentData);
        setConversions(conversionData);
      } catch (error) {
        console.error("Error loading analytics:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [dateRange]);

  const handleExport = () => {
    if (!pageViews?.rawData) return;
    
    const exportData = pageViews.rawData.map((view: any) => ({
      data: format(new Date(view.viewed_at), "yyyy-MM-dd HH:mm:ss"),
      pagina: view.page_title || view.page_url,
      url: view.page_url,
      referrer: view.referrer || "Direct",
    }));

    exportToCSV(exportData, "analytics-page-views");
  };

  const setQuickRange = (days: number) => {
    setDateRange({
      from: subDays(new Date(), days),
      to: new Date(),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Analytics & Reporting
          </h2>
          <p className="text-muted-foreground mt-2">
            Date complete despre performanța platformei
          </p>
        </div>
        
        <Button onClick={handleExport} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Perioadă:</span>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickRange(7)}
              >
                7 zile
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickRange(30)}
              >
                30 zile
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickRange(90)}
              >
                90 zile
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    {format(dateRange.from, "dd MMM yyyy", { locale: ro })} -{" "}
                    {format(dateRange.to, "dd MMM yyyy", { locale: ro })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setDateRange({ from: range.from, to: range.to });
                      }
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Eye className="h-5 w-5 text-primary" />
              <Badge variant="secondary">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12%
              </Badge>
            </div>
            <p className="text-sm font-medium text-muted-foreground">Total Vizualizări</p>
            <p className="text-3xl font-bold mt-2">
              {engagement?.totalPageViews.toLocaleString() || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Vizitatori Unici</p>
            <p className="text-3xl font-bold mt-2">
              {engagement?.uniqueVisitors.toLocaleString() || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {engagement?.avgPageViewsPerVisitor.toFixed(1)} pag/vizitator
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Favorite Adăugate</p>
            <p className="text-3xl font-bold mt-2">
              {engagement?.favoritesAdded.toLocaleString() || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Recenzii Trimise</p>
            <p className="text-3xl font-bold mt-2">
              {engagement?.reviewsSubmitted.toLocaleString() || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PageViewsChart data={pageViews?.byDate || {}} />
        </div>
        <RealTimeStats />
      </div>

      {/* Conversion Chart */}
      <ConversionChart data={conversions || {}} />

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Newsletter</h3>
            </div>
            <p className="text-3xl font-bold mb-1">
              {engagement?.newsletterSignups.toLocaleString() || 0}
            </p>
            <p className="text-sm text-muted-foreground">
              Abonări în perioada selectată
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Rata de conversie: {conversions?.newsletterRate.toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Mesaje Contact</h3>
            </div>
            <p className="text-3xl font-bold mb-1">
              {engagement?.contactMessages.toLocaleString() || 0}
            </p>
            <p className="text-sm text-muted-foreground">
              Mesaje primite în perioada selectată
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Rata de conversie: {conversions?.contactRate.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Content Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TopContentTable
          title="Top 10 Obiective"
          data={contentPerformance?.topObjectives || []}
          type="objectives"
        />
        <TopContentTable
          title="Top 10 Articole Blog"
          data={contentPerformance?.topArticles || []}
          type="articles"
        />
      </div>
    </div>
  );
}
