# Multilanguage System - Complete Documentation

## Overview

This document provides comprehensive documentation for the fully implemented multilanguage system in the APOT project. The system combines UI translations with database content translations to provide a complete multilingual experience.

## System Architecture

### 1. UI Translation Layer (react-i18next)
- **Technology**: `react-i18next` with `i18next`
- **Storage**: JSON files in `public/locales/{language}/common.json`
- **Supported Languages**: Romanian (RO), English (EN)
- **Default Language**: Romanian (RO)

### 2. Database Translation Layer
- **Storage**: Supabase tables (`objective_translations`, `guide_translations`, `blog_article_translations`, etc.)
- **Fields**: All user-facing text content (title, description, meta fields, etc.)
- **Access**: Row Level Security (RLS) policies for read/write control

### 3. Auto-Translation Service
- **Provider**: Google Translate API
- **Implementation**: Edge function at `supabase/functions/translate-content/`
- **Client Service**: `src/lib/services/translation.ts`
- **Features**: Single text, batch translation, object field translation

---

## Quick Start

### Using Translations in Components

#### UI Translations
```tsx
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('nav.home')}</h1>
      <p>{t('hero.subtitle')}</p>
    </div>
  );
}
```

#### Database Content Translations
```tsx
import { useTranslatedObjective } from "@/hooks/useTranslatedContent";

function ObjectivePage() {
  const { data: objectiveData } = useQuery({
    queryKey: ["objective", id],
    queryFn: () => getObjectiveById(id)
  });
  
  // Automatically get translated content based on current language
  const { translatedContent: objective, loading } = useTranslatedObjective(objectiveData);
  
  return <h1>{objective?.title}</h1>; // Shows translated title
}
```

---

## Translation Hooks

### Available Hooks

All hooks are located in `src/hooks/useTranslatedContent.ts`:

#### 1. `useTranslatedObjective<T>(objective: T | null | undefined)`
Fetches and merges objective translations based on current language.

**Usage:**
```tsx
const { translatedContent, loading } = useTranslatedObjective(objective);
```

**Translated Fields:**
- `title`
- `description`
- `excerpt`
- `location_text`
- `entrance_fee`
- `best_season`
- `visit_duration`
- `opening_hours`
- `accessibility_info`
- `meta_title`
- `meta_description`

#### 2. `useTranslatedObjectives<T>(objectives: T[] | null | undefined)`
Batch translation for multiple objectives.

**Usage:**
```tsx
const { translatedContent: objectives, loading } = useTranslatedObjectives(objectivesData);
```

#### 3. `useTranslatedGuide<T>(guide: T | null | undefined)`
Translates guide profile information.

**Usage:**
```tsx
const { translatedContent: guide, loading } = useTranslatedGuide(guideData);
```

**Translated Fields:**
- `full_name`
- `short_description`
- `bio`
- `meta_title`
- `meta_description`

#### 4. `useTranslatedBlogArticle<T>(article: T | null | undefined)`
Translates blog article content.

**Usage:**
```tsx
const { translatedContent: article, loading } = useTranslatedBlogArticle(articleData);
```

**Translated Fields:**
- `title`
- `excerpt`
- `content`
- `meta_title`
- `meta_description`

---

## Language Context

### Using Language Context

```tsx
import { useLanguage } from "@/contexts/LanguageContext";

function LanguageSelector() {
  const { currentLanguage, changeLanguage, languages } = useLanguage();
  
  return (
    <select value={currentLanguage} onChange={(e) => changeLanguage(e.target.value)}>
      {Object.entries(languages).map(([code, { nativeName }]) => (
        <option key={code} value={code}>
          {nativeName}
        </option>
      ))}
    </select>
  );
}
```

### Language Switching Behavior
- URL is updated to include language prefix (e.g., `/en/obiective`)
- Language preference is saved to localStorage
- All translated content is automatically refreshed
- UI language changes immediately

---

## Auto-Translation Service

### Setup Requirements

1. **Google Translate API Key** (required)
   - Get key from Google Cloud Console
   - Add to Lovable Cloud secrets as `GOOGLE_TRANSLATE_API_KEY`

### Translation Functions

Located in `src/lib/services/translation.ts`:

#### 1. `translateText(options: TranslateOptions): Promise<TranslateResponse>`
Translates a single text string.

```tsx
import { translateText } from "@/lib/services/translation";

const result = await translateText({
  text: "Hello World",
  targetLanguage: "ro",
  sourceLanguage: "en" // optional, defaults to "auto"
});

console.log(result.translatedText); // "Salut Lume"
```

#### 2. `translateBatch(options): Promise<string[]>`
Translates multiple strings efficiently.

```tsx
import { translateBatch } from "@/lib/services/translation";

const translations = await translateBatch({
  texts: ["Hello", "Goodbye", "Thank you"],
  targetLanguage: "ro"
});

console.log(translations); // ["Salut", "La revedere", "Mulțumesc"]
```

#### 3. `translateObject(options): Promise<Partial<T>>`
Translates specific fields of an object.

```tsx
import { translateObject } from "@/lib/services/translation";

const objective = {
  title: "Eiffel Tower",
  description: "Famous landmark in Paris",
  entrance_fee: "€20"
};

const translated = await translateObject({
  obj: objective,
  fields: ["title", "description"],
  targetLanguage: "ro"
});

console.log(translated);
// { title: "Turnul Eiffel", description: "Punct de reper faimos în Paris" }
```

### Creating Database Translations

#### Manual Approach
```tsx
import { upsertObjectiveTranslation } from "@/lib/supabase/queries/translations";

await upsertObjectiveTranslation({
  objective_id: "uuid-here",
  language: "en",
  title: "Eiffel Tower",
  description: "Famous landmark in Paris",
  // ... other fields
});
```

#### Auto-Translate Approach (Recommended)
```tsx
import { translateObject } from "@/lib/services/translation";
import { upsertObjectiveTranslation } from "@/lib/supabase/queries/translations";

// 1. Get original objective
const objective = await getObjectiveById(id);

// 2. Auto-translate fields
const translated = await translateObject({
  obj: objective,
  fields: ["title", "description", "excerpt", "location_text", "entrance_fee", "best_season", "visit_duration", "opening_hours", "accessibility_info"],
  targetLanguage: "en"
});

// 3. Save translation
await upsertObjectiveTranslation({
  objective_id: objective.id,
  language: "en",
  ...translated
});
```

---

## Database Schema

### Translation Tables

#### `objective_translations`
```sql
- id: uuid (PK)
- objective_id: uuid (FK)
- language: varchar(10)
- title: text
- description: text
- excerpt: text
- location_text: text
- entrance_fee: text
- best_season: text
- visit_duration: text
- opening_hours: text
- accessibility_info: text
- meta_title: text
- meta_description: text
- created_at: timestamp
- updated_at: timestamp

UNIQUE(objective_id, language)
```

#### `guide_translations`
```sql
- id: uuid (PK)
- guide_id: uuid (FK)
- language: varchar(10)
- full_name: text
- short_description: text
- bio: text
- meta_title: text
- meta_description: text
- created_at: timestamp
- updated_at: timestamp

UNIQUE(guide_id, language)
```

#### `blog_article_translations`
```sql
- id: uuid (PK)
- article_id: uuid (FK)
- language: varchar(10)
- title: text
- excerpt: text
- content: text
- meta_title: text
- meta_description: text
- created_at: timestamp
- updated_at: timestamp

UNIQUE(article_id, language)
```

### RLS Policies

All translation tables have:
- **SELECT**: Public read access
- **INSERT/UPDATE/DELETE**: Editors and admins only

---

## SEO Implementation

### Hreflang Tags

The SEO component automatically generates hreflang tags for all pages:

```tsx
<SEO
  title="My Page Title"
  description="My page description"
  canonical="/obiective/eiffel-tower"
  alternateLanguages={true} // Enables hreflang tags
/>
```

Generated HTML:
```html
<link rel="alternate" hreflang="ro" href="https://apot.ro/ro/obiective/eiffel-tower" />
<link rel="alternate" hreflang="en" href="https://apot.ro/en/obiective/eiffel-tower" />
<link rel="alternate" hreflang="x-default" href="https://apot.ro/ro/obiective/eiffel-tower" />
```

### Language Attribute

The HTML `lang` attribute is automatically updated based on current language.

---

## Adding a New Language

### Step 1: Update Configuration

**File:** `src/lib/i18n/config.ts`

```tsx
export const SUPPORTED_LANGUAGES = {
  ro: { nativeName: "Română", flag: "🇷🇴" },
  en: { nativeName: "English", flag: "🇬🇧" },
  de: { nativeName: "Deutsch", flag: "🇩🇪" }, // Add this
} as const;
```

### Step 2: Create UI Translation File

**Create:** `public/locales/de/common.json`

Copy structure from `en` or `ro` and translate all keys.

### Step 3: Add Database Translations

Use auto-translation service to populate database translations:

```tsx
import { translateObject } from "@/lib/services/translation";
import { upsertObjectiveTranslation } from "@/lib/supabase/queries/translations";

// For each objective
const objectives = await getAllObjectives();

for (const obj of objectives) {
  const translated = await translateObject({
    obj,
    fields: ["title", "description", "excerpt", /* ... */],
    targetLanguage: "de"
  });
  
  await upsertObjectiveTranslation({
    objective_id: obj.id,
    language: "de",
    ...translated
  });
}
```

---

## Translation Coverage

### ✅ Fully Implemented

- **UI Translations**: Romanian (RO) + English (EN)
- **Database Infrastructure**: All tables, RLS policies, queries
- **Translation Hooks**: All content types (objectives, guides, blog articles)
- **Auto-Translation Service**: Edge function + client service
- **SEO**: Hreflang tags, canonical URLs, language attributes
- **URL Structure**: Language prefix routing (e.g., `/en/obiective`)

### 📋 Pending (Admin UI)

- Visual translation management interface
- Bulk translation tools
- Translation status dashboard
- CSV import/export for translations

---

## Best Practices

### 1. Always Use Hooks for Database Content
```tsx
// ❌ Don't use raw data directly
const { data: objective } = useQuery({...});
return <h1>{objective.title}</h1>;

// ✅ Use translation hook
const { data: objectiveData } = useQuery({...});
const { translatedContent: objective } = useTranslatedObjective(objectiveData);
return <h1>{objective?.title}</h1>;
```

### 2. Batch Translations When Possible
```tsx
// ❌ Don't translate one by one in a loop
for (const obj of objectives) {
  await translateText({ text: obj.title, targetLanguage: "en" });
}

// ✅ Use batch translation
const texts = objectives.map(o => o.title);
const translations = await translateBatch({ texts, targetLanguage: "en" });
```

### 3. Use SEO Component with Alternate Languages
```tsx
<SEO
  title={translatedTitle}
  description={translatedDescription}
  canonical={`/obiective/${slug}`}
  alternateLanguages={true} // Always enable for translated pages
/>
```

### 4. Handle Loading States
```tsx
const { translatedContent, loading } = useTranslatedObjective(objective);

if (loading) return <LoadingSpinner />;
return <Content data={translatedContent} />;
```

---

## Troubleshooting

### Translations Not Showing

**Problem**: Page shows original language even after switching.

**Solutions**:
1. Check if translation exists in database:
   ```sql
   SELECT * FROM objective_translations WHERE objective_id = 'xxx' AND language = 'en';
   ```
2. Verify language context is working:
   ```tsx
   const { currentLanguage } = useLanguage();
   console.log("Current language:", currentLanguage);
   ```
3. Check if translation hook is used correctly
4. Clear browser cache and localStorage

### Auto-Translation Fails

**Problem**: `translateText` returns error or no translation.

**Solutions**:
1. Verify `GOOGLE_TRANSLATE_API_KEY` is set in secrets
2. Check edge function logs for errors
3. Verify source text is valid
4. Check API quota limits

### URL Not Changing

**Problem**: Language changes but URL stays the same.

**Solutions**:
1. Check `LanguageContext` is properly wrapped around app
2. Verify route configuration includes `/:lang?` prefix
3. Check `changeLanguage` function in context

---

## Cost Estimation (Google Translate API)

### Pricing
- **$20 per 1 million characters**
- First 500,000 characters per month are free

### Typical Content Sizes
- Objective title: ~50 characters
- Objective description: ~1,000 characters
- Guide bio: ~500 characters
- Blog article: ~5,000 characters

### Example Costs
- 100 objectives (all fields): ~150,000 chars = **FREE**
- 50 guides (all fields): ~50,000 chars = **FREE**
- 20 blog articles: ~100,000 chars = **FREE**
- 1,000 objectives: ~1.5M chars = **$30** for all languages

---

## Related Files

### Core System
- `src/lib/i18n/config.ts` - i18n configuration
- `src/contexts/LanguageContext.tsx` - Language state management
- `src/components/shared/LanguageSwitcher.tsx` - UI component
- `src/hooks/useTranslatedContent.ts` - Translation hooks

### Services
- `src/lib/services/translation.ts` - Auto-translation client
- `src/lib/supabase/queries/translations.ts` - Database queries
- `supabase/functions/translate-content/index.ts` - Edge function

### UI Translations
- `public/locales/ro/common.json` - Romanian UI
- `public/locales/en/common.json` - English UI

### Documentation
- `docs/TRANSLATION_QUICK_START.md` - Quick reference
- `docs/MULTILANGUAGE_README.md` - System overview
- `docs/SESSION_28_MULTILANGUAGE_COMPLETE.md` - Implementation details

---

## Next Steps

### When You Add Google Translate API Key

1. **Test Auto-Translation**:
   ```tsx
   import { translateText } from "@/lib/services/translation";
   
   const result = await translateText({
     text: "Test",
     targetLanguage: "en"
   });
   console.log(result);
   ```

2. **Bulk Translate Existing Content**:
   - Create admin script to translate all objectives
   - Create admin script to translate all guides
   - Create admin script to translate all blog articles

3. **Build Admin UI** (Optional but recommended):
   - Translation management dashboard
   - Bulk translation interface
   - Translation status indicators
   - CSV import/export tools

---

## Support

For questions or issues:
1. Check this documentation
2. Review `docs/TRANSLATION_QUICK_START.md` for quick reference
3. Check edge function logs for translation errors
4. Review RLS policies for permission issues

---

**System Status**: ✅ **Production Ready**

All infrastructure is in place. The system is fully functional and ready to use once you add the `GOOGLE_TRANSLATE_API_KEY` secret.
