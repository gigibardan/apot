# Analytics & Reporting Dashboard

## Overview

Sistem complet de analytics și reporting pentru platforma APOT cu tracking în timp real, charts interactive, și export de rapoarte.

## Features Implementate

### 1. Dashboard Analytics Complet
- **Locație**: `/admin/analytics`
- **Acces**: Doar pentru utilizatori autentificați cu rol de editor/admin
- **Update**: Real-time refresh la fiecare 30 secunde pentru statistici live

### 2. Page Views Tracking
- **Tabel**: `page_views` (deja existent în database)
- **Date colectate**:
  - URL pagină
  - Titlu pagină
  - Referrer
  - User agent
  - IP address
  - Session ID
  - Timestamp

### 3. Key Metrics Dashboard

#### Vizualizări Totale
- Total page views în perioada selectată
- Trend indicator cu procent de creștere
- Badge cu variația față de perioada anterioară

#### Vizitatori Unici
- Număr de vizitatori unici (bazat pe session_id/IP)
- Medie pagini pe vizitator
- Analiză comportament utilizatori

#### Favorite Adăugate
- Număr total de obiective/ghizi adăugați la favorite
- Tracking engagement utilizatori

#### Recenzii Trimise
- Total recenzii obiective + ghizi
- Indicator calitate engagement

### 4. Charts Interactive (Recharts)

#### Page Views Chart (Line Chart)
- Vizualizări pe zile în perioada selectată
- Smooth animation
- Tooltips interactive
- Responsive design

#### Conversion Chart (Bar Chart)
- Rate de conversie pentru:
  - Newsletter signups
  - Favorite adds
  - Review submissions
  - Contact form submissions
- Procentaje calculate automat
- Color coding pentru clarity

### 5. Real-Time Statistics

#### Live Stats Widget
- Auto-refresh la 30 secunde
- Ultimas 24h de activitate:
  - Total vizualizări
  - Vizitatori unici
  - Breakdown pe oră
  - Pagini recent vizitate cu timestamps

### 6. Content Performance

#### Top 10 Obiective
- Sortate după views_count
- Display cu featured image
- Views + likes count
- Link direct către obiectiv

#### Top 10 Articole Blog
- Sortate după views_count
- Display cu featured image
- Views count
- Link direct către articol

#### Top 10 Ghizi
- Sortate după contact_count
- Display contact count
- Rating average + reviews count

### 7. User Engagement Metrics

- **Unique Visitors**: Număr vizitatori unici în perioada
- **Total Page Views**: Total vizualizări pagină
- **Favorites Added**: Obiective/ghizi adăugate la favorite
- **Reviews Submitted**: Total recenzii obiective + ghizi
- **Newsletter Signups**: Noi abonați newsletter
- **Contact Messages**: Mesaje primite prin formulare
- **Avg Pages/Visitor**: Medie pagini vizitate per vizitator

### 8. Conversion Tracking

Toate conversiile calculate automat ca procent din total sesiuni:

- **Newsletter Rate**: % vizitatori care se abonează
- **Favorites Rate**: % vizitatori care adaugă favorite
- **Review Rate**: % vizitatori care lasă recenzii
- **Contact Rate**: % vizitatori care trimit mesaje

### 9. Date Range Filters

#### Quick Range Buttons
- 7 zile
- 30 zile
- 90 zile

#### Custom Date Picker
- Calendar component (react-day-picker)
- Select custom range
- Visual feedback
- Bilingual support (RO)

### 10. Export Functionality

#### CSV Export
- Export toate page views în perioada selectată
- Coloane: Data, Pagina, URL, Referrer
- Nume fișier cu timestamp automat
- Format: `analytics-page-views-YYYY-MM-DD.csv`

## Structură Fișiere

```
src/
├── lib/
│   └── supabase/
│       └── queries/
│           └── analytics.ts              # Toate query functions
├── components/
│   └── admin/
│       └── analytics/
│           ├── PageViewsChart.tsx        # Line chart pentru page views
│           ├── TopContentTable.tsx       # Tabel top content
│           ├── ConversionChart.tsx       # Bar chart conversii
│           └── RealTimeStats.tsx         # Widget stats real-time
└── pages/
    └── admin/
        └── Analytics.tsx                 # Main analytics page

docs/
└── ANALYTICS_SYSTEM.md                   # Această documentație
```

## Query Functions

### `getPageViewsAnalytics(dateRange: DateRange)`
Returnează toate page views în perioada selectată + agregare pe date.

**Return:**
```typescript
{
  total: number;
  byDate: Record<string, number>;
  rawData: PageView[];
}
```

### `getTopPages(dateRange: DateRange, limit: number)`
Top pagini vizitate în perioada.

**Return:**
```typescript
Array<{
  url: string;
  title: string;
  views: number;
}>
```

### `getUserEngagementMetrics(dateRange: DateRange)`
Metrici complete de engagement.

**Return:**
```typescript
{
  uniqueVisitors: number;
  totalPageViews: number;
  favoritesAdded: number;
  reviewsSubmitted: number;
  newsletterSignups: number;
  contactMessages: number;
  avgPageViewsPerVisitor: number;
}
```

### `getContentPerformance(dateRange: DateRange)`
Top content pe categorii.

**Return:**
```typescript
{
  topObjectives: Objective[];
  topArticles: BlogArticle[];
  topGuides: Guide[];
}
```

### `getConversionMetrics(dateRange: DateRange)`
Rate de conversie.

**Return:**
```typescript
{
  newsletterRate: number;      // %
  favoritesRate: number;        // %
  reviewRate: number;           // %
  contactRate: number;          // %
  totalConversions: number;
}
```

### `getRealTimeStats()`
Statistici ultimele 24h.

**Return:**
```typescript
{
  last24h: {
    views: number;
    visitors: number;
    byHour: Record<string, number>;
  };
  recentPages: PageView[];
}
```

### `exportToCSV(data: any[], filename: string)`
Export date la CSV cu download automat.

## Cum să Folosești

### 1. Accesează Dashboard-ul
```
/admin/analytics
```

### 2. Selectează Perioada
- Click pe butoanele quick range (7/30/90 zile), SAU
- Click pe data picker pentru perioadă custom

### 3. Vizualizează Metrics
- Key metrics cards în top
- Page views chart cu trend
- Real-time stats cu auto-refresh
- Conversion rates cu detalii

### 4. Explorează Content Performance
- Top obiective cu views/likes
- Top articole blog cu views
- Top ghizi cu contacte

### 5. Export Rapoarte
- Click "Export CSV" în header
- Fișierul se descarcă automat
- Include toate page views din perioada

## Best Practices

### Performance
- **Query Optimization**: Toate query-urile folosesc indexuri pe timestamp
- **Batch Loading**: Date încărcate parallel cu Promise.all
- **Real-time Throttling**: Refresh rate limitat la 30s pentru a nu supraîncărca

### UI/UX
- **Loading States**: Spinner clar când se încarcă date
- **Error Handling**: Fallback pentru toate query-urile
- **Responsive**: Funcționează perfect pe mobile/tablet/desktop
- **Tooltips**: Charts interactive cu detalii on hover

### Data Integrity
- **Session Tracking**: Folosim session_id + IP pentru unique visitors
- **Deduplication**: Conversiile calculate corect evitând duplicates
- **Date Validation**: Toate date range-urile validate înainte de query

## Viitoare Îmbunătățiri (Opțional)

### Geographic Distribution Map
Pentru a implementa harta geografică, vei avea nevoie de:

1. **GeoIP Service** (ex: MaxMind GeoLite2)
   - Convertește IP address în locație
   - Database local sau API call

2. **Mapbox Integration**
   - Vizualizare interactivă pe hartă
   - Markers pentru concentrație vizitatori
   - Heatmap overlay

3. **Implementation Steps**:
```typescript
// Install GeoIP library
npm install geoip-lite

// În analytics.ts
import geoip from 'geoip-lite';

export async function getGeographicDistribution(dateRange: DateRange) {
  const { data } = await supabase
    .from("page_views")
    .select("ip_address")
    .gte("viewed_at", dateRange.from.toISOString())
    .lte("viewed_at", dateRange.to.toISOString());

  const locations = data?.map(view => {
    const geo = geoip.lookup(view.ip_address);
    return {
      country: geo?.country,
      city: geo?.city,
      lat: geo?.ll[0],
      lon: geo?.ll[1],
    };
  });

  return groupByCountry(locations);
}
```

### Search Analytics
Pentru a tracka ce caută utilizatorii:

1. **Adaugă tabel nou**:
```sql
CREATE TABLE search_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL,
  results_count integer,
  user_id uuid,
  session_id text,
  created_at timestamp with time zone DEFAULT now()
);
```

2. **Track în SearchBar component**:
```typescript
// În SearchBar.tsx
const handleSearch = async (query: string) => {
  await supabase.from('search_queries').insert({
    query,
    results_count: results.length,
    session_id: getSessionId(),
  });
};
```

### Advanced Reporting
- **PDF Export**: Folosind `jsPDF` sau `react-pdf`
- **Email Reports**: Scheduled reports via edge functions
- **Custom Dashboards**: Salvează configurări personale
- **Alerts**: Notificări când metricile scad/cresc dramatic

## Troubleshooting

### "Nicio dată disponibilă"
**Cauză**: Nu există page views în perioada selectată sau RLS policies blochează accesul.

**Soluție**:
1. Verifică că ești autentificat ca editor/admin
2. Selectează o perioadă mai mare
3. Verifică RLS policies pe tabelul `page_views`

### Real-time stats nu se actualizează
**Cauză**: Component nu reface query-ul sau conexiunea la DB este întreruptă.

**Soluție**:
1. Refresh manual pagina
2. Check browser console pentru erori
3. Verifică că supabase client este configurat corect

### Export CSV nu funcționează
**Cauză**: Browser blochează download-ul sau nu există date.

**Soluție**:
1. Permite downloads în browser
2. Verifică că există page views în perioada
3. Check browser console pentru erori

### Charts nu se afișează corect
**Cauză**: Responsive container sau date format incorect.

**Soluție**:
1. Verifică că data este în formatul corect pentru Recharts
2. Check că container-ul are înălțime definită
3. Testează pe viewport diferit

## Support

Pentru întrebări sau probleme:
1. Check această documentație
2. Review code în `src/lib/supabase/queries/analytics.ts`
3. Test query-urile manual în Supabase dashboard
4. Verifică RLS policies și permissions

---

**Status**: ✅ **Production Ready**
**Ultima actualizare**: 2025-11-30
**Credite estimate utilizate**: 22/25
