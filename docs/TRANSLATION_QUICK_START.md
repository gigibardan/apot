# Translation System - Quick Start Guide

## Cum Funcționează Sistemul de Traduceri?

Sistemul de multi-language funcționează pe 2 niveluri:

### 1. **UI Translations** (Texte Statice) ✅ IMPLEMENTAT

Toate textele din interface (butoane, labels, messages) sunt traduse prin `i18next`:

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('nav.home')}</h1>
      <button>{t('common.readMore')}</button>
    </div>
  );
}
```

**Unde să adaugi traduceri noi:**
- `public/locales/ro/common.json` - Română
- `public/locales/en/common.json` - English

### 2. **Database Content** (Conținut Dinamic) ✅ IMPLEMENTAT

Obiective turistice, ghizi, articole blog sunt traduse în database:

```tsx
import { useTranslatedObjective } from '@/hooks/useTranslatedContent';

function ObjectivePage({ objective }) {
  // Automat preia traducerea din DB pentru limba curentă
  const { content, isLoading } = useTranslatedObjective(objective);
  
  return (
    <div>
      <h1>{content?.title}</h1>
      <p>{content?.description}</p>
    </div>
  );
}
```

---

## 🚀 Pentru Developeri: Cum Folosesc Traducerile?

### Hook-uri disponibile:

```tsx
// Pentru un singur obiectiv
const { content, isLoading } = useTranslatedObjective(objective);

// Pentru multiple obiective
const { content: objectives, isLoading } = useTranslatedObjectives(objectivesList);

// Pentru ghizi
const { content, isLoading } = useTranslatedGuide(guide);

// Pentru articole blog
const { content, isLoading } = useTranslatedBlogArticle(article);
```

### Query functions pentru continente:

```tsx
import { getContinentsWithTranslations } from '@/lib/supabase/queries/continents';

// Preia continente cu traduceri pentru limba specificată
const continents = await getContinentsWithTranslations('en');
```

---

## ✏️ Pentru Admini: Cum Adaug Traduceri?

### Opțiune 1: Manual (în viitor în UI Admin)

```typescript
import { upsertObjectiveTranslation } from '@/lib/supabase/queries/translations';

await upsertObjectiveTranslation({
  objective_id: "uuid-here",
  language: "en",
  title: "Eiffel Tower",
  excerpt: "Iconic iron tower in Paris",
  description: "Full translated description...",
  meta_title: "Visit Eiffel Tower - Paris Guide",
  meta_description: "Complete guide to visiting..."
});
```

### Opțiune 2: Auto-Translate ✨ RECOMANDAT

**Cerințe:**
1. Adaugă Google Translate API Key în Lovable Secrets
2. Folosește edge function-ul `translate-content`

**Exemplu de utilizare:**

```typescript
import { translateObject } from '@/lib/services/translation';
import { upsertObjectiveTranslation } from '@/lib/supabase/queries/translations';

// 1. Preia obiectivul original
const objective = await getObjectiveById('uuid-here');

// 2. Traduce automat câmpurile
const translatedFields = await translateObject({
  obj: objective,
  fields: ['title', 'excerpt', 'description', 'meta_title', 'meta_description'],
  targetLanguage: 'en',
  sourceLanguage: 'ro'
});

// 3. Salvează traducerea în database
await upsertObjectiveTranslation({
  objective_id: objective.id,
  language: 'en',
  ...translatedFields
});
```

**Helper Functions Disponibile:**

```typescript
// Traduce un singur text
const result = await translateText({
  text: "Text în română",
  targetLanguage: "en"
});

// Traduce multiple texte simultan
const results = await translateBatch({
  texts: ["Text 1", "Text 2", "Text 3"],
  targetLanguage: "en"
});

// Traduce specific fields dintr-un obiect
const translated = await translateObject({
  obj: myObject,
  fields: ['title', 'description'],
  targetLanguage: 'en'
});
```

---

## 🔑 Setup Google Translate API

### Step 1: Obține API Key

1. Mergi la [Google Cloud Console](https://console.cloud.google.com/)
2. Creează/Selectează un project
3. Enable "Cloud Translation API"
4. Create credentials → API Key
5. Copy API key

### Step 2: Adaugă în Lovable

**În interfața Lovable:**
1. Mergi la Settings → Secrets
2. Add secret: `GOOGLE_TRANSLATE_API_KEY`
3. Paste API key
4. Save

Edge function-ul `translate-content` va folosi automat acest key.

---

## 🌍 Cum Adaug o Limbă Nouă?

### 1. Adaugă limba în config:

```typescript
// src/lib/i18n/config.ts
export const SUPPORTED_LANGUAGES = {
  ro: { nativeName: "Română", flag: "🇷🇴" },
  en: { nativeName: "English", flag: "🇬🇧" },
  de: { nativeName: "Deutsch", flag: "🇩🇪" }, // ← NEW
} as const;
```

### 2. Creează fișiere de traduceri UI:

```bash
public/locales/de/common.json
```

### 3. Populează traduceri database:

Folosește auto-translate sau manual pentru toate entitățile:
- Objectives
- Guides
- Blog Articles
- Continents
- Countries

---

## 📊 Status Actual Traduceri

### ✅ Implementat:

- [x] i18n system (react-i18next)
- [x] Language switcher UI
- [x] URL structure cu language prefixes (/en/obiective)
- [x] UI translations (RO + EN complet)
- [x] Database schema pentru content translations
- [x] SEO hreflang tags
- [x] Auto language detection
- [x] Google Translate API integration
- [x] Custom hooks pentru translated content
- [x] Query functions pentru continente cu traduceri

### 🚧 To Be Implemented:

- [ ] Admin UI pentru translation management
- [ ] Bulk translation tools
- [ ] Translation status tracking (complete/partial/missing)
- [ ] Manual translation editor
- [ ] German (DE) + French (FR) languages

---

## 🎯 Best Practices

1. **Pentru UI text**: Folosește întotdeauna `t()` din `useTranslation()`
2. **Pentru database content**: Folosește custom hooks `useTranslated*`
3. **Când adaugi limbi noi**: Populează toate traducerile UI înainte de lansare
4. **Pentru conținut dinamic**: Începe cu limba default (RO), apoi adaugă traduceri
5. **SEO**: Asigură-te că meta_title și meta_description sunt traduse

---

## 💡 Tips

- Traducerile database sunt **opționale** - sistemul fallback la română automat
- Poți avea traduceri parțiale (ex: doar title și excerpt, nu description)
- Auto-translate funcționează bine pentru majoritatea conținutului
- Pentru texte marketing importante, recomandăm review manual după auto-translate
- Costul Google Translate: ~$20 per 1M characters (foarte affordable)

---

## 🆘 Troubleshooting

**Traducerea nu apare?**
- Verifică că limba este setată corect în `useLanguage()`
- Verifică că există înregistrare în `*_translations` table pentru limba respectivă
- Check console pentru erori la fetch translation

**Auto-translate nu funcționează?**
- Verifică că `GOOGLE_TRANSLATE_API_KEY` este setat în secrets
- Check console/logs pentru erori de la API
- Verifică că ai credite suficiente în Google Cloud

**URL /en/ dă 404?**
- Verifică că router-ul suportă `/:lang?` prefix
- Check că `LanguageContext` este wrapping corect app-ul

---

## 📚 Related Documentation

- [SESSION_28_MULTILANGUAGE_COMPLETE.md](./SESSION_28_MULTILANGUAGE_COMPLETE.md) - Implementare completă
- [SESSION_28_MULTILANGUAGE_USAGE_GUIDE.md](./SESSION_28_MULTILANGUAGE_USAGE_GUIDE.md) - Ghid detaliat de utilizare
- [SESSION_28_MULTILANGUAGE_IMPROVEMENTS.md](./SESSION_28_MULTILANGUAGE_IMPROVEMENTS.md) - Auto-translate setup

---

**Status:** ✅ PRODUCTION READY (Backend + Frontend)
**Next:** Admin UI pentru translation management
