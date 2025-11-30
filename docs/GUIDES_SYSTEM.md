# SISTEM GHIZI PROFESIONIȘTI - DOCUMENTAȚIE COMPLETĂ

## Data implementării: 30 Noiembrie 2024

## 📋 OVERVIEW

Sistem complet pentru managementul ghizilor profesioniști cu două categorii:
1. **Ghizi Verificați** - Profesioniști cu profil complet, featured pe site
2. **Ghizi Autorizați** - Lista completă de 4000+ ghizi autorizați de Ministerul Turismului

## 🗄️ STRUCTURA BAZEI DE DATE

### Tabele Create

#### 1. `guides` - Ghizi Profesioniști Verificați
```sql
- id (UUID, PK)
- full_name (text, NOT NULL)
- slug (text, UNIQUE)
- bio (text) - Biografie completă HTML
- short_description (text) - Descriere scurtă 200 caractere
- profile_image (text) - URL imagine profil
- years_experience (integer)
- languages (text[]) - Array limbi vorbite
- specializations (text[]) - Array specializări
- geographical_areas (text[]) - Array zone geografice
- email, phone, whatsapp, website_url (text)
- price_per_day, price_per_group (numeric)
- verified (boolean) - Badge verificat
- featured (boolean) - Apare pe homepage
- active (boolean) - Vizibil pe site
- verification_date (timestamp)
- verification_notes (text) - Note interne admin
- rating_average (numeric 3,2) - Rating calculat automat
- reviews_count (integer) - Număr recenzii
- views_count, contact_count (integer)
- meta_title, meta_description (text) - SEO
- availability_calendar_url (text) - Link calendar extern
- created_at, updated_at, created_by, updated_by
```

#### 2. `authorized_guides` - Ghizi Autorizați Minister
```sql
- id (UUID, PK)
- full_name (text, NOT NULL)
- license_number (text, UNIQUE) - Număr licență GTR
- specialization (text)
- languages (text[])
- region (text)
- phone, email (text)
- license_active (boolean)
- license_expiry_date (date)
- created_at, updated_at
```

#### 3. `guide_reviews` - Recenzii Ghizi
```sql
- id (UUID, PK)
- guide_id (UUID, FK guides)
- user_id (UUID, FK auth.users)
- rating (integer 1-5, NOT NULL)
- title (text)
- comment (text)
- travel_date (date)
- approved (boolean) - Moderare admin
- guide_response (text) - Răspuns ghid
- guide_response_date (timestamp)
- helpful_count (integer)
- created_at, updated_at
- UNIQUE(guide_id, user_id) - O recenzie per user per ghid
```

#### 4. `guides_objectives_relations` - Relație Many-to-Many
```sql
- id (UUID, PK)
- guide_id (UUID, FK guides)
- objective_id (UUID, FK objectives)
- created_at
- UNIQUE(guide_id, objective_id)
```

### Triggers & Functions

**Auto-update Rating:**
```sql
CREATE FUNCTION update_guide_rating() 
- Se declanșează la INSERT/UPDATE/DELETE pe guide_reviews
- Recalculează rating_average și reviews_count automat
```

### RLS Policies

**guides:**
- SELECT: Activi sau authenticated users
- INSERT/UPDATE: can_edit_content()
- DELETE: has_role('admin')

**authorized_guides:**
- SELECT: Public
- ALL: can_edit_content()

**guide_reviews:**
- SELECT: Aprobate sau authenticated
- INSERT: User propriu
- UPDATE: User propriu în 48h
- Admin: ALL

## 🎨 COMPONENTE FRONTEND

### Admin Pages

#### `/admin/ghizi` - GuidesAdmin.tsx
- Listare ghizi verificați cu search
- Badge-uri: Verificat, Featured, Inactiv
- Filtrare și sortare
- Acțiuni: Edit, Delete, Preview
- Link către ghizi autorizați

#### `/admin/ghizi/nou` - GuideForm.tsx
**5 Tab-uri:**
1. **Informații de Bază:** Nume, slug, imagine, descrieri, bio HTML
2. **Profesional:** Experiență, specializări (10 predefinite), limbi, zone
3. **Contact & Prețuri:** Email, telefon, WhatsApp, website, tarife, calendar
4. **Obiective:** Selectare obiective expert (checkbox multiplu)
5. **SEO & Status:** Verified, Featured, Active, meta tags, SEO helper

**Features:**
- Auto-slug din nume
- ImageUpload pentru profil
- RichTextEditor cu HTML mode pentru bio
- Tag input pentru limbi și zone geografice
- Checkbox grid pentru specializări
- SEOHelper integrat
- Character counters pentru meta tags

#### `/admin/ghizi-autorizati` - AuthorizedGuidesAdmin.tsx
- Listare 4000+ ghizi din ministerul turismului
- **Import CSV masiv:**
  - Download template CSV cu exemplu
  - Upload și parse automat
  - Validare și insert bulk
  - Progress tracking
- Search după nume sau licență
- Display: nume, licență, specializare, limbi, regiune, contact, status

**CSV Template Format:**
```csv
full_name,license_number,specialization,languages,region,phone,email,license_active,license_expiry_date
Ion Popescu,GTR123456,Ghid Turistic,română;engleză;franceză,București,0722123456,ion@ex.com,true,2025-12-31
```

### Public Pages

#### `/ghizi` - GuidesPage.tsx
- Grid responsive 3 coloane
- **Filtre:**
  - Search text
  - Dropdown specializare
  - Dropdown regiune
- Card design:
  - Imagine profil circular
  - Nume + badge verificat
  - Rating cu stele + număr recenzii
  - Descriere scurtă
  - Specializări (max 3 + counter)
  - Zone geografice
  - Limbi vorbite
  - Ani experiență

#### `/ghid/:slug` - GuideSinglePage.tsx
**Layout 2 coloane:**

**Coloana principală:**
- Hero: Imagine mare, nume, badges, rating, descriere, buttons contact
- Biografie completă HTML
- Obiective expert cu mini-cards
- Recenzii detaliate cu răspunsuri ghid

**Sidebar:**
- Card tarife (per zi / per grup)
- Limbi vorbite cu icon
- Specializări badges
- Zone geografice cu icon MapPin

**CTA Section:**
- Call-to-action mare colorat
- Buttons contact direct

#### Widget Homepage - FeaturedGuides.tsx
- Secțiune dedicată "Ghizii Noștri Profesioniști"
- 6 ghizi featured în grid
- Badge "Ghizi Verificați"
- Link "Vezi Toți Ghizii"
- Skeleton loading states

## 🔧 QUERIES & MUTATIONS

### Queries (`src/lib/supabase/queries/guides.ts`)
```typescript
getGuides(params) // Cu filtre: search, specialization, region, featured, minRating
getGuideBySlug(slug) // Include objectives + reviews cu user profiles
getFeaturedGuides(limit) // Pentru homepage
getGuidesForObjective(objectiveId) // Ghizi pentru un obiectiv
getGuideSpecializations() // Array unic specializări
getGuideRegions() // Array unic zone
getAuthorizedGuides(params) // Cu pagination și filtre
```

### Mutations (`src/lib/supabase/mutations/guides.ts`)
```typescript
createGuide(data) // Auto-set created_by/updated_by
updateGuide(id, data) // Auto-set updated_by, updated_at
deleteGuide(id) // CASCADE delete reviews & relations
bulkInsertAuthorizedGuides(guides[]) // Import CSV masiv
linkGuideToObjective(guideId, objectiveId)
updateGuideObjectives(guideId, objectiveIds[]) // Replace all
```

## 🎯 FEATURES CHEIE

### 1. Sistem Verificare
- Toggle verified în form admin
- Badge vizibil pe profil și cards
- Note verificare interne
- Data verificării auto-set

### 2. Rating & Reviews
- Rating 1-5 stele obligatoriu
- Un review per user per ghid
- Moderare admin (approved)
- Răspuns ghid la review
- Rating calculat automat cu trigger
- Edit permis 48h după creare

### 3. Specializări Predefinite
```typescript
const SPECIALIZATIONS = [
  "Munte & Trekking",
  "Cultură & Istorie",
  "Natură & Wildlife",
  "Urban & City Tours",
  "Aventură & Sport",
  "Spiritualitate & Yoga",
  "Gastronomie & Vinuri",
  "Fotografie",
  "Familie & Copii",
  "Luxury Tours",
];
```

### 4. SEO Optimization
- Meta title/description custom
- Auto-generation dacă lipsesc
- SEOHelper integrat în form
- Slug SEO friendly
- Structured data ready

### 5. Contact Direct
- Email, telefon, WhatsApp buttons
- Link calendar disponibilitate (Calendly, etc.)
- Website personal
- Tracking contact_count (planificat)

## 📱 NAVIGATION & ROUTING

### Public Routes
```typescript
/ghizi - Listare ghizi
/ghid/:slug - Profil individual
```

### Admin Routes
```typescript
/admin/ghizi - Listare
/admin/ghizi/nou - Create
/admin/ghizi/:id/edit - Edit
/admin/ghizi-autorizati - Ghizi ministerul
```

### Header Navigation
```typescript
Acasă | Obiective | Ghizi | Blog | Despre | Contact
```

### Admin Sidebar
```typescript
Dashboard | Obiective | Blog | Circuite | Ghizi | Media | Setări
```

## 🚀 WORKFLOW RECOMANDAT

### Populare Ghizi Verificați (Manual)
1. Click "Adaugă Ghid" în admin
2. Tab "Informații de Bază": Nume, imagine, descrieri, bio
3. Tab "Profesional": Experiență, specializări, limbi, zone
4. Tab "Contact": Email, telefon, tarife, calendar
5. Tab "Obiective": Selectează obiective expert
6. Tab "SEO": Toggle verified/featured, meta tags
7. Salvează → Ghidul apare pe site

### Import Masiv Ghizi Autorizați
1. Accesează `/admin/ghizi-autorizati`
2. Click "Template CSV" → Download exemplu
3. Pregătește CSV cu 4000+ ghizi (Excel/Google Sheets)
4. Click "Import CSV" → Upload fișier
5. Validare automată + import bulk
6. Verifică în tabel rezultatele

### Featured pe Homepage
1. În edit ghid, activează toggle "Featured"
2. Ghidul apare automat în widget homepage
3. Max 6 ghizi, sortați după rating
4. Auto-refresh fără deploy

## 📊 STATS & ANALYTICS

**Implemented:**
- views_count pe profil ghid
- reviews_count + rating_average
- Tracking clicks circuite (existing)

**Planificat:**
- contact_count tracking
- conversion tracking
- A/B testing featured ghizi

## 🔐 SECURITY

- RLS pe toate tabelele
- Verified status doar admin
- Reviews cu moderare opțională
- User poate edita review 48h
- Delete cascade pentru integritate
- Auth required pentru actions

## 🎉 STATUS: COMPLET ȘI FUNCTIONAL

Toate componentele sunt implementate și documentate. Sistemul este gata pentru:
- ✅ Adăugare ghizi verificați manual
- ✅ Import CSV masiv ghizi autorizați
- ✅ Listare și filtrare publică
- ✅ Profile complete individuale
- ✅ Widget homepage featured
- ✅ Reviews și rating system
- ✅ SEO optimization
- ✅ Admin CRUD complet

**Next steps:** Populare cu date reale și testare end-to-end.
