# USER PUBLIC PROFILES SYSTEM - Documentație Completă

## 📋 Prezentare Generală

Sistemul de profiluri publice permite utilizatorilor să vizualizeze activitatea, conținutul și realizările altor membri ai comunității. Această funcționalitate este esențială pentru aspectul social al platformei APOT.

## 🎯 Funcționalități Implementate

### 1. Pagina de Profil Public (`/profil/:username`)

**Locație:** `src/pages/UserProfile.tsx`

Pagina de profil afișează:
- Header cu avatar, nume, username, bio
- Butoane de follow (dacă nu este propriul profil)
- Link-uri către social media și website
- Statistici de follow (followers/following)
- 5 statistici principale: Favorites, Reviews, Posts, Level, Badges
- Sistem de puncte și level cu progress bar
- Badge-uri câștigate
- 4 tab-uri cu conținut:
  - **Activity**: Activitatea recentă a utilizatorului
  - **Favorites**: Obiectivele favorite
  - **Reviews**: Recenziile scrise (obiective + ghizi)
  - **Posts**: Posturile de pe forum

### 2. Componente de Afișare

#### UserActivityList
**Locație:** `src/components/features/social/UserActivityList.tsx`

**Funcționalitate:**
- Afișează ultimele 20 activități ale utilizatorului
- Tipuri de activități suportate:
  - `favorite_added` - Obiectiv adăugat la favorite
  - `review_posted` - Recenzie postată
  - `forum_post` - Post nou pe forum
  - `forum_reply` - Răspuns pe forum
  - `objective_visited` - Obiectiv vizitat
  - `badge_earned` - Badge câștigat
  - `user_followed` - User nou urmărit
- Icon și culoare specifică pentru fiecare tip
- Timestamp relativ (ex: "acum 2 ore")
- Loading și empty states

**API Query:** `getUserRecentActivity(userId, limit)`

#### UserFavoritesList
**Locație:** `src/components/features/social/UserFavoritesList.tsx`

**Funcționalitate:**
- Grid responsive (1/2/3 coloane)
- Carduri cu imagine, titlu, excerpt
- Locație (țară + continent)
- Link către pagina obiectivului
- Hover effects
- Paginare (12 per pagină)
- Butón "Încarcă mai multe"

**API Query:** `getUserFavorites(userId, page, limit)`

#### UserReviewsList
**Locație:** `src/components/features/social/UserReviewsList.tsx`

**Funcționalitate:**
- Combină recenziile de obiective și ghizi
- Afișează rating cu stele
- Preview de conținut (200 caractere)
- Badge pentru tip (Obiectiv/Ghid)
- Helpful count
- Link către conținutul recenzat
- Paginare

**API Query:** `getUserReviews(userId, page, limit)`

#### UserPostsList
**Locație:** `src/components/features/social/UserPostsList.tsx`

**Funcționalitate:**
- Liste de posturi de forum
- Category badge cu culoare
- Preview conținut (200 caractere)
- Metrici: views, replies, upvotes
- Link către post complet
- Paginare

**API Query:** `getUserForumPosts(userId, page, limit)`

### 3. API Queries

**Locație:** `src/lib/supabase/queries/social.ts`

#### `getUserProfile(username)`
Returnează profil complet cu:
- Date de bază (nume, username, bio, avatar)
- Statistici follow
- Puncte și level
- Badge-uri câștigate

#### `getUserStats(userId)`
Returnează numărătoare pentru:
- Favorites count
- Reviews count (obiective + ghizi)
- Posts count
- Followers count
- Following count

#### `getUserFavorites(userId, page, limit)`
```typescript
// Returnează:
{
  favorites: Array<{
    id: string,
    created_at: string,
    objective: {
      id, slug, title, excerpt, featured_image,
      country: { name },
      continent: { name }
    }
  }>,
  total: number,
  hasMore: boolean
}
```

#### `getUserReviews(userId, page, limit)`
```typescript
// Combină și returnează:
{
  reviews: Array<{
    id, rating, title, comment, created_at, helpful_count,
    type: 'objective' | 'guide',
    objective?: {...} | guide?: {...}
  }>,
  total: number,
  hasMore: boolean
}
```

#### `getUserForumPosts(userId, page, limit)`
```typescript
// Returnează:
{
  posts: Array<{
    id, slug, title, content, created_at,
    views_count, replies_count, upvotes_count,
    category: { id, slug, name, color }
  }>,
  total: number,
  hasMore: boolean
}
```

#### `getUserRecentActivity(userId, limit)`
```typescript
// Returnează:
Array<{
  id: string,
  user_id: string,
  activity_type: string,
  target_type: string,
  target_id: string,
  created_at: string,
  metadata?: Record<string, any>
}>
```

## 🔗 Integrare cu Restul Aplicației

### Routing
**Locație:** `src/App.tsx`

Route definit: `/profil/:username`

### Link-uri către Profiluri

Pentru a crea link-uri către profilurile utilizatorilor din alte părți ale aplicației:

```tsx
import { Link } from "react-router-dom";

// Link către profil
<Link to={`/profil/${username}`}>
  {user.full_name}
</Link>
```

### Locații unde ar trebui adăugate link-uri:
1. **Forum Posts** - click pe numele autorului
2. **Forum Replies** - click pe numele celui care răspunde
3. **Reviews** - click pe numele reviewerului
4. **Leaderboards** - click pe numele utilizatorilor
5. **Activity Feed** - click pe numele actorilor

## 🎨 Design & UX

### Responsive Design
- **Mobile**: Layout pe o coloană, statistici în 2 coloane
- **Tablet**: Grid 2 coloane pentru favorites
- **Desktop**: Grid 3 coloane pentru favorites, layout complet

### Loading States
Toate componentele au loading states cu spinner centrat

### Empty States
Fiecare tab are empty state cu:
- Icon specific
- Mesaj descriptiv
- Design consistent

### Hover Effects
- Carduri: Shadow effect
- Imagini: Scale effect (105%)
- Link-uri: Color transition

## 🔒 Permisiuni & Privacy

### Profil Public vs Privat
În viitor se poate extinde cu:
```typescript
// În profiles table
is_private: boolean
```

Când `is_private = true`:
- Doar followers pot vedea conținutul
- Profilele apar ca "Private Profile"
- Butoan "Request to Follow"

### Vizibilitate Conținut
Toate query-urile respectă:
- `approved = true` pentru reviews
- `status = 'active'` pentru posturi forum
- `published = true` pentru obiective

## 📊 Performanță

### Optimizări Implementate

1. **Pagination**: Toate listele sunt paginate (12 items/page)
2. **React Query Caching**: Date cache-uite automat
3. **Lazy Loading**: Imagini cu loading lazy
4. **Selective Queries**: Se iau doar câmpurile necesare

### Cache Invalidation

Când utilizatorul face acțiuni, trebuie invalidat cache-ul:

```typescript
import { useQueryClient } from "@tanstack/react-query";

const queryClient = useQueryClient();

// După follow/unfollow
queryClient.invalidateQueries(['userProfile', username]);
queryClient.invalidateQueries(['userStats', userId]);

// După review nou
queryClient.invalidateQueries(['userReviews', userId]);

// După post nou
queryClient.invalidateQueries(['userForumPosts', userId]);
```

## 🧪 Testing

### Test Manual

1. **Vizualizare Profil**
   ```
   - Accesează /profil/[un-username-existent]
   - Verifică dacă toate datele se încarcă corect
   - Verifică responsive pe mobile/tablet/desktop
   ```

2. **Follow Functionality**
   ```
   - Follow un user
   - Verifică dacă counterul se actualizează
   - Unfollow user
   - Verifică dacă counterul scade
   ```

3. **Tab Navigation**
   ```
   - Navighează prin toate cele 4 tab-uri
   - Verifică loading states
   - Verifică empty states (user fără conținut)
   - Verifică paginarea
   ```

4. **Links**
   ```
   - Click pe obiective favorite → redirect către obiectiv
   - Click pe reviews → redirect către obiectiv/ghid
   - Click pe post forum → redirect către post
   ```

### Scenarii Edge Case

- User fără username → eroare
- User inexistent → "User not found"
- User fără avatar → fallback icon
- User fără bio → nu se afișează secțiunea
- User fără conținut → empty states
- User bannat → ???  (TODO: implementare)

## 🚀 Extinderi Viitoare

### Features Planificate

1. **User Blocking**
   - Butón "Block User"
   - Utilizatorii blocați nu pot vedea profilul
   - Nu apar în search/leaderboards

2. **Profile Privacy Settings**
   - Toggle public/private
   - Selectare ce tab-uri să fie vizibile
   - Aprobări manual pentru followers

3. **Profile Badges Display**
   - Tooltip cu descriere badge
   - Progress către next badge
   - Badge showcase (max 3 featured badges)

4. **Advanced Statistics**
   - Grafice de activitate în timp
   - Heatmap contribuții
   - Streaks și achievements

5. **Profile Customization**
   - Cover image
   - Custom colors/themes
   - Featured content section

## 📝 Migrări Database

### Tabele Folosite

**Existente:**
- `profiles` - Date de bază utilizator
- `user_follows` - Relații follow
- `user_points` - Puncte și level
- `user_badges` - Badge-uri câștigate
- `user_activity` - Log activitate
- `user_favorites` - Favorite obiective
- `objective_reviews` - Recenzii obiective
- `guide_reviews` - Recenzii ghizi
- `forum_posts` - Posturi forum

**Necesare pentru Privacy (viitor):**
```sql
ALTER TABLE profiles 
ADD COLUMN is_private BOOLEAN DEFAULT false;

ALTER TABLE profiles
ADD COLUMN show_favorites BOOLEAN DEFAULT true;

ALTER TABLE profiles
ADD COLUMN show_reviews BOOLEAN DEFAULT true;

ALTER TABLE profiles
ADD COLUMN show_posts BOOLEAN DEFAULT true;
```

## 🔧 Configurare

### Environment Variables
Nicio variabilă nouă necesară.

### Dependencies
Toate dependințele sunt deja în proiect:
- `@tanstack/react-query` - Data fetching
- `date-fns` - Date formatting
- `react-router-dom` - Routing
- `lucide-react` - Icons

## 📚 Documentație API Completă

Vezi comentariile din fișierele individuale pentru documentație detaliată pe fiecare funcție.

## ✅ Checklist Implementare

- [x] API queries pentru profil public
- [x] Componente UI pentru toate tab-urile
- [x] Responsive design
- [x] Loading & empty states
- [x] Paginare
- [x] SEO optimization
- [x] Type safety
- [x] Query caching
- [x] Error handling
- [x] Documentație completă

## 🐛 Known Issues

Niciun issue cunoscut în această versiune.

## 📞 Support

Pentru probleme sau întrebări despre acest sistem, verifică:
1. Această documentație
2. Comentariile din cod
3. Network tab pentru debugging API calls
4. React Query Devtools pentru cache inspection

---

**Ultima actualizare:** 30 Noiembrie 2024
**Versiune:** 1.0.0
**Status:** ✅ Production Ready