# 🌍 Multi-Language System - Quick Reference

## Status: ✅ PRODUCTION READY

### What's Implemented

#### ✅ UI Translations (Complete)
- **Romanian (RO)**: 150+ translation keys ✅
- **English (EN)**: 150+ translation keys ✅
- Language switcher în header cu animations
- Auto language detection (URL, localStorage, browser)
- SEO hreflang tags pentru fiecare limbă

#### ✅ Database Infrastructure (Complete)
- 6 translation tables created
- RLS policies configured
- API helper functions ready
- Triggers pentru updated_at

#### ✅ Auto-Translation Service (Ready)
- Google Translate API integration
- Edge function deployed: `translate-content`
- Client service helpers
- Batch translation support

#### 🚧 Admin UI (Not Built)
- Translation management interface (to be implemented)
- Visual editor for translations
- Bulk import/export tools

---

## Quick Start

### 1. Using Translations în Code

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('hero.title')}</h1>
      <p>{t('hero.subtitle')}</p>
      <button>{t('common.search')}</button>
    </div>
  );
}
```

### 2. Change Language

```tsx
import { useLanguage } from '@/contexts/LanguageContext';

function LanguageSelector() {
  const { currentLanguage, changeLanguage } = useLanguage();
  
  return (
    <button onClick={() => changeLanguage('en')}>
      Switch to English
    </button>
  );
}
```

### 3. Auto-Translate Content (Requires API Key)

```typescript
import { translateText } from '@/lib/services/translation';

// Translate single text
const result = await translateText({
  text: "Turnul Eiffel este un monument iconic",
  targetLanguage: "en",
  sourceLanguage: "ro"
});
// Returns: "The Eiffel Tower is an iconic monument"

// Translate multiple fields
import { translateObject } from '@/lib/services/translation';

const translated = await translateObject({
  obj: objective,
  fields: ['title', 'description', 'excerpt'],
  targetLanguage: 'en'
});
```

---

## URL Structure

```
Romanian (default):
/ - Homepage
/obiective - Objectives listing
/ghizi - Guides listing
/blog - Blog

English:
/en - Homepage
/en/obiective - Objectives listing
/en/ghizi - Guides listing
/en/blog - Blog

Future (German, French, etc.):
/de/obiective
/fr/obiective
```

---

## Available Translation Keys

### Navigation (`nav.*`)
- `home`, `objectives`, `guides`, `blog`, `about`, `contact`
- `forum`, `dashboard`, `favorites`, `login`, `logout`, `profile`

### Hero Section (`hero.*`)
- `title`, `subtitle`, `description`
- `searchPlaceholder`, `exploreButton`

### Common (`common.*`)
- `search`, `filter`, `reset`, `apply`, `cancel`, `save`
- `edit`, `delete`, `back`, `next`, `previous`
- `loading`, `noResults`, `showMore`, `showLess`
- `readMore`, `viewDetails`, `theme`, `error`, `success`

### Homepage (`home.*`)
- `continents.title`, `continents.subtitle`
- `featuredObjectives.title`, `featuredObjectives.subtitle`
- `circuits.title`, `blog.title`, `newsletter.title`
- `guides.title`

### Filters (`filters.*`)
- `continent`, `country`, `type`, `unesco`, `featured`
- `sortBy`, `sortNewest`, `sortOldest`, `sortPopular`, `sortRating`

### Objectives (`objectives.*`)
- `title`, `featured`, `unesco`, `popular`, `recent`
- `views`, `reviews`, `rating`, `location`, `details`
- `gallery`, `map`, `contact`, `booking`

### Guides (`guides.*`)
- `title`, `featured`, `specialization`, `languages`
- `experience`, `rating`, `reviews`
- `pricePerDay`, `pricePerGroup`, `bookNow`
- `contactGuide`, `verified`, `yearsExperience`

### Blog (`blog.*`)
- `title`, `latestArticles`, `readingTime`
- `category`, `tags`, `relatedArticles`

### Forum (`forum.*`)
- `title`, `categories`, `posts`, `replies`, `views`
- `lastActivity`, `createPost`, `reply`, `edit`, `delete`

### Contact (`contact.*`)
- `title`, `getInTouch`, `name`, `email`, `phone`
- `subject`, `message`, `send`, `success`, `error`

### Auth (`auth.*`)
- `login`, `signup`, `email`, `password`
- `confirmPassword`, `forgotPassword`, `rememberMe`
- `loginButton`, `signupButton`, `continueWithGoogle`

### Footer (`footer.*`)
- `description`, `quickLinks`, `followUs`, `newsletter`
- `newsletterDescription`, `emailPlaceholder`, `subscribe`

---

## Adding New Languages

### Step 1: Update Config
```typescript
// src/lib/i18n/config.ts
export const SUPPORTED_LANGUAGES = {
  ro: { nativeName: "Română", flag: "🇷🇴" },
  en: { nativeName: "English", flag: "🇬🇧" },
  de: { nativeName: "Deutsch", flag: "🇩🇪" }, // NEW
} as const;
```

### Step 2: Create Translation File
```bash
mkdir -p public/locales/de
cp public/locales/en/common.json public/locales/de/common.json
# Edit and translate the file
```

### Step 3: Done!
Language automatically appears în LanguageSwitcher.

---

## Database Translations

### Available Tables
- `objective_translations`
- `guide_translations`
- `blog_article_translations`
- `continent_translations`
- `country_translations`
- `objective_type_translations`

### Example: Save Translation
```typescript
import { upsertObjectiveTranslation } from '@/lib/supabase/queries/translations';

await upsertObjectiveTranslation({
  objective_id: 'uuid-here',
  language: 'en',
  title: 'Eiffel Tower',
  description: 'An iconic monument in Paris...',
  meta_title: 'Eiffel Tower - Complete Guide',
  meta_description: 'Everything you need to know...'
});
```

### Example: Get Translation
```typescript
import { getObjectiveTranslation } from '@/lib/supabase/queries/translations';

const translation = await getObjectiveTranslation(
  objectiveId,
  'en'
);

if (translation) {
  console.log(translation.title); // "Eiffel Tower"
}
```

---

## Auto-Translation Setup

### Requirements
1. Google Cloud account
2. Cloud Translation API enabled
3. API Key created

### Add API Key
```bash
# Go to Lovable → Settings → Secrets
# Add new secret:
GOOGLE_TRANSLATE_API_KEY=your_key_here
```

### Usage
```typescript
import { translateText } from '@/lib/services/translation';

const result = await translateText({
  text: "Text de tradus",
  targetLanguage: "en"
});

console.log(result.translatedText); // "Text to translate"
```

---

## Cost Information

### Google Translate API Pricing
- **Free tier**: $10/month (≈500,000 characters)
- **Beyond free**: $20 per 1M characters

### Example Costs
- **1 objective**: ~1,450 chars = $0.029
- **1000 objectives**: ~1.45M chars = $29
- **Free tier covers**: ~345 objectives/month

**Conclusion**: Very affordable! Free tier perfect for starting.

---

## SEO Benefits

### Implemented
✅ Hreflang tags pentru fiecare limbă
✅ Lang attribute în HTML (`<html lang="ro">`)
✅ Canonical URLs per limbă
✅ URL structure cu language prefixes

### Example Meta Tags
```html
<html lang="ro">
<link rel="canonical" href="https://apot.ro/obiective" />
<link rel="alternate" hreflang="ro" href="https://apot.ro/obiective" />
<link rel="alternate" hreflang="en" href="https://apot.ro/en/obiective" />
<link rel="alternate" hreflang="x-default" href="https://apot.ro/obiective" />
```

---

## Files Structure

```
src/
├── lib/
│   ├── i18n/
│   │   └── config.ts                    # i18next configuration
│   └── services/
│       └── translation.ts               # Auto-translate helpers
├── contexts/
│   └── LanguageContext.tsx             # Language management
├── components/
│   ├── seo/
│   │   └── SEO.tsx                     # SEO with hreflang
│   └── shared/
│       └── LanguageSwitcher.tsx        # Language dropdown
└── lib/supabase/queries/
    └── translations.ts                  # DB translation queries

public/
└── locales/
    ├── ro/
    │   └── common.json                 # Romanian translations
    └── en/
        └── common.json                 # English translations

supabase/
└── functions/
    └── translate-content/
        └── index.ts                    # Auto-translate edge function
```

---

## Troubleshooting

### Translations Not Loading
1. Check browser console for errors
2. Verify translation files exist în `public/locales/`
3. Clear browser cache
4. Check i18n initialization în `src/main.tsx`

### Language Not Switching
1. Verify LanguageProvider wraps App
2. Check URL structure
3. Clear localStorage
4. Check browser console

### Auto-Translate Not Working
1. Verify GOOGLE_TRANSLATE_API_KEY secret is set
2. Check edge function logs
3. Verify API key permissions
4. Check API quota limits

---

## Next Steps

### 🚧 To Be Implemented

1. **Admin Translation UI**
   - Translation management page
   - Visual translation editor
   - Bulk translation actions
   - Import/Export tools

2. **Additional Languages**
   - German (DE)
   - French (FR)
   - Spanish (ES)
   - Italian (IT)

3. **Advanced Features**
   - Translation memory
   - Translation quality checks
   - Version history
   - Collaboration features

---

## Support

**Documentation:**
- `docs/SESSION_28_MULTILANGUAGE_COMPLETE.md` - Full implementation details
- `docs/SESSION_28_MULTILANGUAGE_USAGE_GUIDE.md` - Detailed usage guide
- `docs/SESSION_28_MULTILANGUAGE_IMPROVEMENTS.md` - Latest improvements

**External Resources:**
- [i18next Documentation](https://www.i18next.com/)
- [react-i18next](https://react.i18next.com/)
- [Google Translate API](https://cloud.google.com/translate/docs)
- [SEO Multi-language Best Practices](https://developers.google.com/search/docs/specialty/international)

---

**Last Updated:** 30 Noiembrie 2024
**Status:** ✅ Production Ready (UI) + 🚧 Auto-translate Ready (needs API key)
