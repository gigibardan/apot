# Sistem Complet de Management Utilizatori

## Data implementării: Ianuarie 2026

## Prezentare Generală

Sistemul de management utilizatori oferă administratorilor control complet asupra ciclului de viață al utilizatorilor platformei APOT. Acesta include listare, creare directă, invitare, gestionare roluri, banare/suspendare, resetare parolă și ștergere conturi.

## Acces

**URL:** `/admin/utilizatori`

**Cerințe:** Utilizator autentificat cu rol `admin`

---

## Funcționalități

### 1. Listare Utilizatori

#### Afișare
- **Tabel cu utilizatori** care include:
  - Avatar și nume
  - Email
  - Rol (admin, editor, contributor, user)
  - Status (activ, banat, suspendat)
  - Data înregistrării
  - Ultima autentificare
  - Acțiuni disponibile

#### Căutare
- Căutare în timp real după nume sau email
- Filtrare după rol (toate, admin, editor, contributor, user)
- Filtrare după status (toate, activ, banat, suspendat)

#### Sortare
- Coloane sortabile: nume, email, rol, status, data creării, ultima autentificare
- Direcție ascendentă/descendentă

---

### 2. Creare Utilizator Direct

Administratorul poate crea un utilizator nou cu:
- **Email** (obligatoriu, confirmat automat)
- **Nume complet** (obligatoriu)
- **Parolă** (obligatoriu, minim 6 caractere)
- **Rol** (user/contributor/editor/admin)

**Avantaj:** Utilizatorul poate să se autentifice imediat, fără a fi nevoie de confirmare email.

**Edge Function:** `create-user`

---

### 3. Invitare Utilizator

Trimite o invitație pe email cu link pentru setarea parolei:
- **Email** (obligatoriu)
- **Nume** (obligatoriu)
- **Rol inițial** (user/contributor/editor/admin)

**Edge Function:** `invite-user`

---

### 4. Gestionare Roluri

Rolurile disponibile:
| Rol | Descriere |
|-----|-----------|
| `admin` | Acces complet la toate funcționalitățile |
| `editor` | Poate edita conținut existent |
| `contributor` | Poate crea conținut nou |
| `user` | Utilizator standard, acces limitat |

**Protecție:** Trebuie să existe întotdeauna cel puțin un administrator.

---

### 5. Sistem Banare/Suspendare

#### Ban Permanent
- Utilizatorul este blocat definitiv
- Nu poate accesa platforma
- Poate fi ridicat manual de admin

#### Suspendare Temporară
- Utilizatorul este blocat până la o dată specificată
- Suspendarea expiră automat (via trigger DB)
- Poate fi ridicată manual înainte de expirare

#### Câmpuri necesare:
- **Tip:** ban permanent sau suspendare temporară
- **Motiv:** obligatoriu, vizibil pentru admin
- **Note interne:** opțional, pentru referință internă
- **Data expirare:** obligatoriu pentru suspendări

**Edge Function:** `manage-user-ban`

#### Acțiuni disponibile:
- `ban` - Banare/suspendare utilizator
- `unban` - Ridicare ban/suspendare

---

### 6. Resetare Parolă

Administratorul poate seta o parolă nouă pentru orice utilizator:
- Minim 6 caractere
- Utilizatorul trebuie să schimbe parola la prima autentificare (recomandat)

**Edge Function:** `reset-user-password`

---

### 7. Ștergere Utilizator

Șterge permanent un cont de utilizator:
- Dialog de confirmare
- Nu poate fi anulat
- Șterge și datele asociate (conform politicilor RLS)

**Protecție:** Administratorul nu își poate șterge propriul cont.

**Edge Function:** `delete-user`

---

## Arhitectură Tehnică

### Edge Functions

| Funcție | Metodă | Descriere |
|---------|--------|-----------|
| `get-users` | GET | Listare toți utilizatorii cu detalii complete |
| `get-user-stats` | GET | Statistici: total, per rol, banați, activi |
| `create-user` | POST | Creare utilizator cu email confirmat |
| `invite-user` | POST | Invitare prin email |
| `manage-user-ban` | POST | Banare/suspendare/ridicare restricții |
| `reset-user-password` | POST | Schimbare parolă utilizator |
| `delete-user` | DELETE | Ștergere permanentă |

### Tabel `user_bans`

```sql
CREATE TABLE public.user_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  banned_by UUID NOT NULL REFERENCES auth.users(id),
  ban_type TEXT NOT NULL CHECK (ban_type IN ('ban', 'suspend')),
  reason TEXT NOT NULL,
  notes TEXT,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Funcții Database

#### `is_user_banned(user_id UUID)`
Verifică dacă un utilizator este banat sau suspendat activ.

#### `expire_suspensions()`
Dezactivează automat suspendările expirate.

---

## Securitate

### Verificări în Edge Functions
1. **Autentificare:** Verificare token JWT valid
2. **Autorizare:** Verificare rol `admin` din tabelul `user_roles`
3. **Protecție self-action:** Admin-ul nu poate șterge/bana propriul cont
4. **Validare date:** Verificare câmpuri obligatorii

### RLS Policies
- Tabelul `user_bans` e protejat prin RLS
- Doar admin-ii pot vedea/modifica ban-uri
- Utilizatorii pot vedea doar propriul status

---

## UI/UX

### Indicatori Status

| Status | Culoare | Icon |
|--------|---------|------|
| Activ | Verde | ✓ |
| Suspendat | Galben/Portocaliu | ⏳ |
| Banat | Roșu | ✕ |

### Tab-uri
1. **Lista Utilizatori** - Tabel complet cu acțiuni
2. **Management Banări** - Vizualizare restricții active, istoric

### Statistici Dashboard
- Total utilizatori
- Utilizatori per rol
- Utilizatori banați/suspendați
- Utilizatori noi (ultimele 30 zile)
- Utilizatori activi (autentificați recent)

---

## Exemple de Utilizare

### Creare utilizator nou
1. Click pe "Creare Utilizator"
2. Completează: email, nume, parolă, rol
3. Click "Creează Utilizator"
4. Utilizatorul poate accesa platforma imediat

### Suspendare temporară utilizator
1. Find user în tabel
2. Click meniu acțiuni → "Banare/Suspendare"
3. Selectează "Suspendare temporară"
4. Completează motivul și data expirare
5. Click "Aplică restricție"

### Ridicare ban
1. Find user banat în tabel
2. Click meniu acțiuni → "Ridică ban"
3. Confirmare în dialog
4. Utilizatorul poate accesa din nou platforma

---

## Troubleshooting

### "Nu am putut încărca utilizatorii"
- Verifică că ești autentificat ca admin
- Verifică conexiunea la internet
- Verifică logurile edge function pentru erori

### "Failed to create user"
- Email-ul există deja în sistem
- Parola prea scurtă (<6 caractere)
- Verifică logurile `create-user`

### "Nu pot bana utilizatorul"
- Nu poți bana un alt admin
- Verifică că ai completat motivul
- Pentru suspendare, data expirare e obligatorie

---

## Fișiere Relevante

```
src/pages/admin/Users.tsx          - Pagina principală management
src/pages/admin/UserBanManagement.tsx - Componenta management banări
supabase/functions/get-users/      - Edge function listare
supabase/functions/get-user-stats/ - Edge function statistici
supabase/functions/create-user/    - Edge function creare
supabase/functions/manage-user-ban/- Edge function banări
supabase/functions/delete-user/    - Edge function ștergere
supabase/functions/reset-user-password/ - Edge function resetare parolă
```

---

## Versiuni

| Versiune | Data | Modificări |
|----------|------|------------|
| 1.0 | Ian 2026 | Implementare inițială completă |
