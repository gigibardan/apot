# Multi-Language System - Usage Guide

## Quick Start

### Adding Translations to UI

**Step 1: Add translation keys la JSON files**
```json
// public/locales/ro/common.json
{
  "mySection": {
    "title": "Titlul meu",
    "button": "Apasă aici"
  }
}

// public/locales/en/common.json
{
  "mySection": {
    "title": "My title",
    "button": "Click here"
  }
}
```

**Step 2: Use în component**
```tsx
import { useTranslation } from 'react-i18next';

export function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('mySection.title')}</h1>
      <button>{t('mySection.button')}</button>
    </div>
  );
}
```

---

## Working with Database Translations

### Get Translation pentru un Objective
```tsx
import { getObjectiveTranslation } from '@/lib/supabase/queries/translations';
import { useLanguage } from '@/contexts/LanguageContext';

export function ObjectiveDetail({ objectiveId }) {
  const { currentLanguage } = useLanguage();
  const [translation, setTranslation] = useState(null);
  
  useEffect(() => {
    async function loadTranslation() {
      const trans = await getObjectiveTranslation(objectiveId, currentLanguage);
      setTranslation(trans);
    }
    loadTranslation();
  }, [objectiveId, currentLanguage]);
  
  return (
    <div>
      <h1>{translation?.title || objective.title}</h1>
      <p>{translation?.description || objective.description}</p>
    </div>
  );
}
```

### Create/Update Translation
```tsx
import { upsertObjectiveTranslation } from '@/lib/supabase/queries/translations';

async function saveTranslation() {
  await upsertObjectiveTranslation({
    objective_id: objectiveId,
    language: 'en',
    title: 'My Translated Title',
    description: 'My translated description...',
    meta_title: 'SEO Title',
    meta_description: 'SEO Description'
  });
}
```

---

## Language Context Usage

### Get Current Language
```tsx
import { useLanguage } from '@/contexts/LanguageContext';

export function MyComponent() {
  const { currentLanguage, languages } = useLanguage();
  
  return (
    <div>
      Current: {currentLanguage}
      Available: {Object.keys(languages).join(', ')}
    </div>
  );
}
```

### Change Language Programmatically
```tsx
import { useLanguage } from '@/contexts/LanguageContext';

export function LanguageButtons() {
  const { changeLanguage } = useLanguage();
  
  return (
    <div>
      <button onClick={() => changeLanguage('ro')}>Română</button>
      <button onClick={() => changeLanguage('en')}>English</button>
    </div>
  );
}
```

---

## SEO per Language

### Add hreflang tags la o pagină
```tsx
import { SEO } from '@/components/seo/SEO';

export function MyPage() {
  return (
    <>
      <SEO
        title="Titlul Paginii"
        description="Descrierea paginii"
        canonical="/my-page"
        alternateLanguages={true}  // Enable hreflang tags
      />
      {/* Rest of page content */}
    </>
  );
}
```

Aceasta va genera automat:
```html
<link rel="alternate" hreflang="ro" href="https://apot.ro/my-page" />
<link rel="alternate" hreflang="en" href="https://apot.ro/en/my-page" />
<link rel="alternate" hreflang="x-default" href="https://apot.ro/my-page" />
```

---

## Adding a New Language

### Step 1: Update Config
```typescript
// src/lib/i18n/config.ts
export const SUPPORTED_LANGUAGES = {
  ro: { nativeName: "Română", flag: "🇷🇴" },
  en: { nativeName: "English", flag: "🇬🇧" },
  de: { nativeName: "Deutsch", flag: "🇩🇪" },  // NEW
} as const;
```

### Step 2: Create Translation Files
```bash
# Create new translation files
mkdir -p public/locales/de
cp public/locales/en/common.json public/locales/de/common.json
# Edit and translate public/locales/de/common.json
```

### Step 3: Add Database Translations
```sql
-- Admin can add translations via database
INSERT INTO objective_translations (objective_id, language, title, description)
VALUES ('objective-uuid', 'de', 'Deutscher Titel', 'Deutsche Beschreibung');
```

---

## Translation Fallback Strategy

Sistemul folosește următoarea ordine pentru fallback:

1. **Database translation** (pentru conținut dinamic)
   ```tsx
   translation?.title || objective.title
   ```

2. **JSON translation** (pentru UI strings)
   ```tsx
   t('myKey')  // Falls back to RO automatically
   ```

3. **Original content** (limba default - română)

---

## Best Practices

### ✅ DO
- Use translation keys descriptive: `hero.title` not `t1`
- Group related translations: `nav.*`, `hero.*`, `footer.*`
- Always provide fallback pentru missing translations
- Test în toate limbile înainte de deploy
- Use structured data pentru translations complexe

### ❌ DON'T
- Hardcode text în componente
- Use translation keys prea lungi
- Forget să adaugi translations pentru limba nouă
- Mix translated și untranslated content
- Use inline translations pentru text lung

---

## Common Patterns

### Pattern 1: Translation cu Variables
```tsx
const { t } = useTranslation();

// JSON:
// "greeting": "Hello, {{name}}!"

return <h1>{t('greeting', { name: user.name })}</h1>;
```

### Pattern 2: Plural Forms
```tsx
// JSON:
// "items": "{{count}} item",
// "items_plural": "{{count}} items"

return <p>{t('items', { count: items.length })}</p>;
```

### Pattern 3: Rich Text Translation
```tsx
// JSON:
// "richText": "Click <1>here</1> to continue"

return (
  <Trans i18nKey="richText">
    Click <Link to="/page">here</Link> to continue
  </Trans>
);
```

---

## Debugging

### Check Current Language
```tsx
import { useTranslation } from 'react-i18next';

const { i18n } = useTranslation();
console.log('Current language:', i18n.language);
console.log('Available languages:', i18n.languages);
```

### Check if Translation Exists
```tsx
const { t, i18n } = useTranslation();

if (i18n.exists('my.key')) {
  console.log('Translation exists');
} else {
  console.log('Translation missing');
}
```

### List All Translation Keys
```tsx
const { i18n } = useTranslation();
const translations = i18n.getResourceBundle('ro', 'common');
console.log('All keys:', Object.keys(translations));
```

---

## Admin Tools (To Be Implemented)

### Translation Management Page
Location: `/admin/translations`

**Features needed:**
- List all content needing translation
- Filter by entity type (objectives, guides, blog)
- Show completion status per language
- Bulk translation actions
- Export/Import CSV

### Translation Editor
**Features needed:**
- Side-by-side editor (original | translation)
- Rich text support
- Auto-save
- Translation memory
- Google Translate API integration

---

## API Reference

### Translation Queries
```typescript
// Get translation
getObjectiveTranslation(objectiveId, language)
getGuideTranslation(guideId, language)
getBlogArticleTranslation(articleId, language)

// Create/Update translation
upsertObjectiveTranslation(translation)
upsertGuideTranslation(translation)
upsertBlogArticleTranslation(translation)

// Delete translation
deleteObjectiveTranslation(objectiveId, language)
deleteGuideTranslation(guideId, language)
deleteBlogArticleTranslation(articleId, language)

// Get all translations for entity
getAllObjectiveTranslations(objectiveId)

// Get missing translations
getMissingObjectiveTranslations(language, limit)
```

### Language Context
```typescript
interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  changeLanguage: (lng: SupportedLanguage) => void;
  languages: typeof SUPPORTED_LANGUAGES;
}

// Usage
const { currentLanguage, changeLanguage, languages } = useLanguage();
```

---

## Troubleshooting

### Translations Not Loading
1. Check if translation files exist în `public/locales/{lang}/common.json`
2. Verify JSON syntax este valid
3. Check browser console pentru errors
4. Clear browser cache și localStorage

### Language Not Switching
1. Verify `LanguageProvider` wraps App
2. Check if language code este în `SUPPORTED_LANGUAGES`
3. Verify URL structure este correct
4. Check localStorage pentru cached language

### SEO Tags Not Showing
1. Verify `alternateLanguages={true}` în SEO component
2. Check if `canonical` prop este provided
3. View page source to verify hreflang tags
4. Test cu Google Search Console

---

**For more info, see:** `docs/SESSION_28_MULTILANGUAGE_COMPLETE.md`
