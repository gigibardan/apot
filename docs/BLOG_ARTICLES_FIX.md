# Reparare Articole Blog - Sincronizare Formular & Bază de Date

## Problemele Identificate

### 1. **Câmpuri Inexistente Trimise la Baza de Date**
Formularul de articole trimitea câmpuri care nu existau în tabela `blog_articles`:
- `author_name` și `author_avatar` (DB are doar `author_id`)
- `featured_until` (nu există)
- `canonical_url` (nu există)
- `gallery_images` (nu există)

Eroare: `Could not find the 'author_name' column of 'blog_articles' in the schema cache`

### 2. **Categorii CSV cu Diacritice**
La import CSV, categoriile cu diacritice (ex: "călătorii") nu se potriveau cu enum-ul din DB care acceptă doar:
- calatorii
- calauze
- povesti
- tips
- ghiduri
- destinatii
- inspiratie

### 3. **Articole Importate Nu Apar**
Articolele importate erau setate ca `published: false` dar query-ul implicit forța `published: true`, deci nu apăreau în admin pentru editare.

## Soluții Implementate

### 1. **Curățare Schema Formular** (`src/pages/admin/BlogArticleForm.tsx`)

**Schema Simplificată:**
```typescript
const articleSchema = z.object({
  title: z.string().min(1, "Titlul este obligatoriu").max(200),
  slug: z.string().min(1, "Slug-ul este obligatoriu"),
  excerpt: z.string().max(300).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  content: z.string().optional(),
  featured_image: z.string().min(1, "Imaginea principală este obligatorie"),
  featured: z.boolean().optional(),
  meta_title: z.string().max(60).optional(),
  meta_description: z.string().max(160).optional(),
});
```

**Câmpuri Eliminate:**
- ❌ `author_name`, `author_avatar` (nu există în DB)
- ❌ `featured_until` (nu există în DB)
- ❌ `canonical_url` (nu există în DB)
- ❌ `gallery_images` (nu există în DB)

### 2. **Curățare Date la Submit**

```typescript
async function onSubmit(data: ArticleFormData, published: boolean) {
  // Clean data - only include fields that exist in database
  const articleData = {
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt || null,
    category: data.category || null,
    tags: data.tags || [],
    content: data.content || null,
    featured_image: data.featured_image,
    featured: data.featured || false,
    meta_title: data.meta_title || null,
    meta_description: data.meta_description || null,
    published,
    published_at: published ? new Date().toISOString() : null,
  };
  // ...
}
```

### 3. **Curățare Date la Load**

```typescript
async function loadArticle() {
  const data = await getBlogArticleById(id!);
  if (data) {
    // Only set fields that exist in the form schema
    setValue("title", data.title);
    setValue("slug", data.slug);
    setValue("excerpt", data.excerpt || "");
    // ... doar câmpuri valide
  }
}
```

### 4. **Simplificare UI**

**Tab Media:**
- ✅ Doar imaginea principală (featured_image)
- ❌ Eliminată galeria de imagini

**Tab SEO:**
- ✅ Switch Featured
- ✅ Meta title & description
- ❌ Eliminat author_name
- ❌ Eliminat featured_until
- ❌ Eliminat canonical_url

### 5. **Normalizare Categorii la Import CSV** (`src/pages/admin/BulkImport.tsx`)

```typescript
const importArticle = async (data: any) => {
  // Normalize category to match enum values (remove diacritics)
  let normalizedCategory = null;
  if (data.category) {
    const categoryMap: Record<string, string> = {
      "călătorii": "calatorii",
      "călători": "calatorii", 
      "calatorii": "calatorii",
      "călăuzire": "calauze",
      "călăuze": "calauze",
      "calauze": "calauze",
      "povești": "povesti",
      "povestiri": "povesti",
      "povesti": "povesti",
      "tips": "tips",
      "ghiduri": "ghiduri",
      "ghid": "ghiduri",
      "destinații": "destinatii",
      "destinatii": "destinatii",
      "inspiratie": "inspiratie",
      "inspirație": "inspiratie"
    };
    const lower = data.category.toLowerCase().trim();
    normalizedCategory = categoryMap[lower] || lower;
  }
  // ...
}
```

**Acum acceptă:**
- ✅ "Călătorii", "călători" → `calatorii`
- ✅ "Călăuze", "călăuzire" → `calauze`
- ✅ "Povești", "povestiri" → `povesti`
- ✅ "Destinații" → `destinatii`
- ✅ Și versiunile fără diacritice

### 6. **Fix Query Admin** (`src/lib/supabase/queries/blog.ts`)

**Înainte:**
```typescript
published = true,  // Implicit forța published articles
```

**Acum:**
```typescript
published,  // undefined by default → arată TOATE articolele
```

În admin, când nu specifici filtrul, vezi atât articolele publicate cât și draft-urile, permițând editarea articolelor importate.

## Status Final

✅ **Formular articole:** Trimite doar câmpuri valide către DB
✅ **Import CSV:** Acceptă categorii cu și fără diacritice  
✅ **Afișare admin:** Articolele draft și publicate apar în listă
✅ **Editare:** Articolele importate pot fi editate
✅ **Eliminare câmpuri deprecate:** UI mai simplu și consistent

## Testare

1. **Salvare articol nou:** ✅ Funcționează fără erori
2. **Editare articol existent:** ✅ Încarcă și salvează corect
3. **Import CSV cu diacritice:** ✅ Categoriile sunt normalizate automat
4. **Vizualizare draft-uri în admin:** ✅ Apar în listă pentru editare
5. **Publicare din admin:** ✅ Switch functional

## Date Tehnice

**Fișiere Modificate:**
- `src/pages/admin/BlogArticleForm.tsx` - Curățare schema, load, submit, UI
- `src/pages/admin/BulkImport.tsx` - Normalizare categorii
- `src/lib/supabase/queries/blog.ts` - Query fără filtru implicit published

**Schema DB (nemodificată):**
```sql
blog_articles (
  id, title, slug, content, excerpt,
  category, tags, featured_image,
  author_id,  -- NOT author_name
  published, published_at,
  featured, reading_time, views_count,
  meta_title, meta_description,
  schema_data,  -- JSON pentru date suplimentare
  created_at, updated_at
)
```

## Recomandări Viitoare

1. **Author Management:**
   - Adaugă `author_id` în formular (dropdown cu useri)
   - Sau setează automat la user-ul curent logat

2. **Gallery Images:**
   - Dacă e nevoie, salvează în `schema_data` ca JSON
   - Sau creează tabel separat `blog_article_images`

3. **Validare Categorii:**
   - La CSV import, afișează warning dacă categoria nu e recunoscută
   - Permite mapare manuală în UI

---

**Data fix:** 1 Decembrie 2024
**Impact:** Critical fix - permite salvarea și editarea articolelor
