# GHIZI SYSTEM - GHID DE UTILIZARE COMPLETĂ

## 📖 CUPRINS
1. [Pentru Utilizatori - Cum să cauți și rezervi ghizi](#pentru-utilizatori)
2. [Pentru Admini - Cum să gestionezi ghizii](#pentru-admini)
3. [Troubleshooting](#troubleshooting)

---

## PENTRU UTILIZATORI

### 1. Căutare Ghizi

#### Acces Pagina Ghizi
- Mergi pe `https://apot.vercel.app/ghizi`
- Sau click pe "Ghizi" în meniul principal

#### Căutare Simplă
1. Folosește bara de search de sus
2. Introdu numele ghidului, specializare sau regiune
3. Rezultatele se actualizează automat (debounce 500ms)

#### Filtre Avansate
Click pe butonul "Filtre" pentru a accesa:

**Regiune:**
- Transilvania
- Muntenia
- Moldova
- Oltenia
- Banat
- Crișana
- Maramureș
- Bucovina
- Dobrogea

**Specializare:**
- Istorie
- Natură
- Cultură
- Aventură
- Gastronomie
- Turism religios
- Turism vinicol
- Drumeții montane

**Limbă vorbită:**
- Română, Engleză, Franceză, Germană
- Italiană, Spaniolă, Maghiară

**Sortare:**
- Rating (mare → mic) - *default*
- Nr. recenzii
- Experiență (ani)
- Alfabetic (A-Z)
- Recomandați (featured)

**Filtre Speciale:**
- **Verificați** - Doar ghizi cu verificare oficială
- **Recomandați** - Doar ghizi featured/recomandați

#### Înțelegerea Cardului de Ghid

```
┌─────────────────────────────────────┐
│ [Imagine Profil]  Nume Ghid         │
│                   ⭐ 4.8 (24)      │
│                   ✓ Verificat       │
├─────────────────────────────────────┤
│ Descriere scurtă ghid...           │
├─────────────────────────────────────┤
│ [Istorie] [Cultură] +2             │
│ 📍 Transilvania, Muntenia +1       │
│ 🗣️ Română, Engleză, Franceză       │
│ 💼 15 ani experiență               │
└─────────────────────────────────────┘
```

**Elemente Card:**
- **Imagine profil** - Foto ghid (sau inițială)
- **Nume** - Nume complet ghid
- **Rating** - ⭐ Nota medie (1-5) + număr recenzii
- **Badge "Verificat"** - Ghid verificat oficial
- **Descriere** - Scurtă prezentare (max 2 linii)
- **Specializări** - Max 3 afișate + număr suplimentar
- **Locații** - Zone geografice (max 2 + număr suplimentar)
- **Limbi** - Limbi vorbite
- **Experiență** - Ani de experiență

### 2. Vizualizare Profil Ghid

#### Accesare Profil
- Click pe orice card de ghid din listing
- Sau accesează direct: `/ghid/[slug-ghid]`

#### Structura Profilului

**1. Hero Section (Top)**
```
┌──────────────────────────────────────┐
│  [Imagine    NUME GHID               │
│   Profil]    ⭐ 4.8 (24 recenzii)   │
│              ✓ Verificat             │
│              15 ani experiență       │
│                                      │
│              [WhatsApp] [Email]      │
└──────────────────────────────────────┘
```

**2. Bio și Descriere**
- Text complet cu formatare rich text
- Informații despre experiență și stil de ghidare
- Povestea personală

**3. Detalii Profesionale**

*Specializări:*
- Badge-uri pentru fiecare specializare
- Ex: [Istorie] [Muzee] [Cultură]

*Zone Geografice:*
- Listă zone unde activează ghidul
- Ex: Transilvania, Muntenia, București

*Limbi Vorbite:*
- Listă completă limbi
- Ex: Română, Engleză, Franceză, Germană

**4. Prețuri**
```
💰 Tarife indicative:
   - Persoană/zi: 150 EUR
   - Grup (max 10): 400 EUR/zi
   
⏰ Durată tipică tur: 8-10 ore
📅 Calendar: [Link extern dacă există]
```

**5. Obiective Turistice Asociate**
- Grid cu obiectivele unde poate ghida
- Click pe obiectiv → pagina obiectivului
- Imagine + nume obiectiv

**6. Secțiune Reviews**
- Statistici rating (distribuție 1-5 stele)
- Lista reviews cu:
  - Avatar + nume user
  - Rating cu stele
  - Titlu review
  - Comentariu
  - Data călătoriei
  - Răspuns ghid (dacă există)
- Paginare (10 reviews/pagină)

**7. Booking Form**
```
┌─────────────────────────────────────┐
│  Rezervă acest ghid                 │
├─────────────────────────────────────┤
│  Nume complet*                      │
│  [________________]                 │
│                                     │
│  Email*                             │
│  [________________]                 │
│                                     │
│  Telefon*                           │
│  [________________]                 │
│                                     │
│  Data preferată*                    │
│  [📅 Alege data]                    │
│                                     │
│  Număr persoane*                    │
│  [____]                             │
│                                     │
│  Durată (zile)                      │
│  [____]                             │
│                                     │
│  Destinații                         │
│  [________________]                 │
│                                     │
│  Buget aproximativ                  │
│  [________________]                 │
│                                     │
│  Limbă preferată                    │
│  [▼ Alege limba]                    │
│                                     │
│  Cerințe speciale                  │
│  [___________________]              │
│  [___________________]              │
│                                     │
│  [Trimite cerere]                   │
└─────────────────────────────────────┘
```

### 3. Trimitere Cerere Booking

#### Pași:
1. **Completează formularul** (câmpurile cu * sunt obligatorii)
2. **Specifică detalii călătorie:**
   - Data preferată
   - Număr persoane
   - Durată (zile) - opțional
   - Destinații specifice - opțional
   - Buget aproximativ - pentru negociere
   - Limbă preferată
   - Cerințe speciale (interese, mobilitate, etc.)

3. **Click "Trimite cerere"**

#### Ce se întâmplă după?
- ✅ Primești confirmare pe ecran (toast verde)
- 📧 Primești email de confirmare
- 👨‍💼 Ghidul primește notificare
- 📞 Ghidul te va contacta în 24-48h
- 💬 Negociați detaliile și prețul final

### 4. Lasă Review pentru Ghid

#### Condiții:
- ✅ Trebuie să fii autentificat (login)
- ✅ Un singur review per ghid per user
- ⏰ Poți edita review-ul în primele 48h

#### Pași:
1. **Mergi pe profilul ghidului**
2. **Scroll la secțiunea "Recenzii"**
3. **Click "Adaugă Recenzie"**

4. **Completează formularul:**
   ```
   Rating: ⭐⭐⭐⭐⭐ (1-5 stele) *obligatoriu
   Titlu: Ex: "Experiență extraordinară!"
   Comentariu: Descrie experiența ta
   Data călătoriei: Când ai fost ghidat
   ```

5. **Click "Trimite"**

#### Important:
- ⏳ Review-ul va fi **în așteptare aprobare admin**
- ✅ Vei primi notificare când este aprobat
- 📝 Ghidul poate răspunde la review-ul tău
- ⏰ Poți edita în 48h de la postare

---

## PENTRU ADMINI

### 1. Access Admin Panel

#### Login Admin:
1. Mergi pe `/auth/login`
2. Introdu credențialele admin
3. Vei fi redirecționat către `/admin`

#### Navigare Ghizi:
- Din sidebar: **"Ghizi"** → `/admin/ghizi`
- Sau direct: `https://apot.vercel.app/admin/ghizi`

### 2. Dashboard Ghizi (`/admin/ghizi`)

#### Overview:
```
┌────────────────────────────────────────────┐
│  Ghizi Profesioniști                       │
│  [🔍 Caută ghizi...]  [+ Adaugă Ghid]    │
├────────────────────────────────────────────┤
│  Ghid          │ Spec  │ Zone  │ Status   │
├────────────────────────────────────────────┤
│  Ion Popescu   │ Isto  │ Trans │ ✓ Verif  │
│  ⭐ 4.8 (24)   │ +2    │ +1    │ ⭐ Feat  │
│                │       │       │ [✏️][🗑️] │
└────────────────────────────────────────────┘
```

#### Funcționalități:

**Search:**
- Caută după nume ghid
- Rezultate instant (debounce)

**Coloane Tabel:**
- **Ghid** - Imagine + Nume + Experiență
- **Specializări** - Max 2 badge-uri + counter
- **Zone** - Max 2 zone + counter
- **Rating** - Stele + număr reviews
- **Status** - Badges multiple:
  - ✓ Verificat (verde)
  - ⭐ Featured (galben)
  - ❌ Inactiv (roșu)

**Acțiuni Rapide:**
- 👁️ **View** - Deschide profilul public în tab nou
- ✏️ **Edit** - Mergi la formularul de editare
- 🗑️ **Delete** - Șterge ghid (cu confirmare)

**Top Buttons:**
- 🛡️ **Ghizi Autorizați** - Management ghizi din Ministerul Turismului
- ➕ **Adaugă Ghid** - Form creare ghid nou

### 3. Adaugă/Editează Ghid

#### Accesare Form:
- **Nou**: Click "Adaugă Ghid" → `/admin/ghizi/nou`
- **Edit**: Click ✏️ pe ghid → `/admin/ghizi/:id/edit`

#### Structura Form (5 Tabs):

---

### **TAB 1: Informații de Bază**

```
┌─────────────────────────────────────────┐
│  Nume complet*                          │
│  [_____________________________]        │
│                                         │
│  Slug*                                  │
│  [_____________________________]        │
│  (Auto-generat din nume)                │
│                                         │
│  Imagine profil                         │
│  [📤 Upload imagine]                    │
│  [Preview imagine]                      │
│                                         │
│  Descriere scurtă                       │
│  [_____________________________]        │
│  Max 160 caractere - pentru carduri     │
│  [_____ caractere rămase]               │
│                                         │
│  Bio completă                           │
│  [Rich Text Editor]                     │
│  - Bold, Italic, Lists                  │
│  - Links, Images                        │
│  - Headings                             │
│                                         │
└─────────────────────────────────────────┘
```

**Câmpuri:**
- **Nume complet*** - Ex: "Ion Popescu"
- **Slug*** - URL-friendly, auto-generat (ex: "ion-popescu")
- **Imagine profil** - Upload JPG/PNG, max 2MB, recomandare 500x500px
- **Descriere scurtă** - Max 160 char, apare în carduri și preview
- **Bio completă** - Rich text, prezentare detaliată

---

### **TAB 2: Profesional**

```
┌─────────────────────────────────────────┐
│  Ani experiență                         │
│  [____]                                 │
│                                         │
│  Specializări*                          │
│  [▼ Alege specializări]                 │
│  [Istorie] [x]  [Cultură] [x]          │
│                                         │
│  Opțiuni:                               │
│  □ Ghid Montan                          │
│  □ Ghid Muzee                           │
│  □ Ghid Cultural                        │
│  □ Ghid Gastronomic                     │
│  □ Ghid Natură                          │
│  □ Ghid Urban                           │
│  □ Ghid Religios                        │
│  □ Ghid Istoric                         │
│  □ Ghid Aventură                        │
│  □ Ghid Foto                            │
│                                         │
│  Limbi vorbite*                         │
│  [_____] [+ Adaugă limbă]              │
│  [Română] [x]  [Engleză] [x]           │
│                                         │
│  Zone geografice*                       │
│  [_____] [+ Adaugă zonă]               │
│  [Transilvania] [x]  [București] [x]   │
│                                         │
└─────────────────────────────────────────┘
```

**Câmpuri:**
- **Ani experiență** - Număr întreg (ex: 15)
- **Specializări*** - Multi-select din listă predefinită
- **Limbi vorbite*** - Dynamic add/remove, orice limbă
- **Zone geografice*** - Dynamic add/remove, orice zonă

---

### **TAB 3: Contact & Prețuri**

```
┌─────────────────────────────────────────┐
│  CONTACT                                │
│  ────────────────────────────────────   │
│  Email                                  │
│  [_____________________________]        │
│                                         │
│  Telefon                                │
│  [_____________________________]        │
│                                         │
│  WhatsApp                               │
│  [_____________________________]        │
│                                         │
│  Website                                │
│  [_____________________________]        │
│                                         │
│  PREȚURI                                │
│  ────────────────────────────────────   │
│  Preț per persoană/zi (EUR)            │
│  [_____]                                │
│                                         │
│  Preț per grup/zi (EUR)                │
│  [_____]                                │
│                                         │
│  Calendar disponibilitate (URL)         │
│  [_____________________________]        │
│  Ex: Google Calendar, Calendly          │
│                                         │
└─────────────────────────────────────────┘
```

**Câmpuri:**
- **Email** - Contact email ghid
- **Telefon** - Format: +40XXXXXXXXX
- **WhatsApp** - Același format sau link direct
- **Website** - URL complet website personal
- **Preț persoană/zi** - În EUR (ex: 150)
- **Preț grup/zi** - În EUR (ex: 400)
- **Calendar** - Link către calendar extern (Google Calendar, etc.)

---

### **TAB 4: Obiective Asociate**

```
┌─────────────────────────────────────────┐
│  Obiective turistice                    │
│  ────────────────────────────────────   │
│  [🔍 Caută obiective...]               │
│                                         │
│  [▼ Selectează obiective multiple]      │
│  □ Castelul Bran                        │
│  □ Castelul Peleș                       │
│  □ Sighișoara - Centru Istoric          │
│  □ Transfăgărășan                       │
│  ...                                    │
│                                         │
│  Obiective selectate:                   │
│  [Castelul Bran] [x]                    │
│  [Sighișoara - Centru Istoric] [x]      │
│                                         │
└─────────────────────────────────────────┘
```

**Funcționalități:**
- Multi-select cu toate obiectivele publicate
- Search în listă pentru găsire rapidă
- Preview obiective selectate cu opțiune remove
- Maximum recomandat: 10-15 obiective

---

### **TAB 5: SEO & Status**

```
┌─────────────────────────────────────────┐
│  SEO                                    │
│  ────────────────────────────────────   │
│  Meta Title                             │
│  [_____________________________]        │
│  Auto: "Nume Ghid - Ghid turistic"     │
│  [___/60 caractere]                     │
│                                         │
│  Meta Description                       │
│  [_____________________________]        │
│  [_____________________________]        │
│  Auto: Bio preview                      │
│  [___/160 caractere]                    │
│                                         │
│  📊 SEO Preview:                        │
│  ┌────────────────────────────────┐    │
│  │ Nume Ghid - Ghid turistic      │    │
│  │ apot.vercel.app/ghid/slug      │    │
│  │ Meta description preview...     │    │
│  └────────────────────────────────┘    │
│                                         │
│  STATUS & VERIFICARE                    │
│  ────────────────────────────────────   │
│  ☑ Verificat                            │
│  ☑ Featured (Recomandat)                │
│  ☑ Activ                                │
│                                         │
│  Note verificare                        │
│  [_____________________________]        │
│  [_____________________________]        │
│  Ex: "Verificat licență ANT 123"       │
│                                         │
│  [💾 Salvează]  [❌ Anulează]          │
└─────────────────────────────────────────┘
```

**Câmpuri SEO:**
- **Meta Title** - Auto-generat sau custom, max 60 char
- **Meta Description** - Auto-generat sau custom, max 160 char
- **SEO Preview** - Previzualizare cum apare în Google

**Status:**
- **☑ Verificat** - Ghid verificat oficial (doar admins)
- **☑ Featured** - Apare în secțiunea recomandați
- **☑ Activ** - Vizibil pe site (deactivat = nu apare public)

**Note Verificare:**
- Textarea pentru detalii verificare
- Ex: număr licență, dată verificare, documente

---

### 4. Management Review-uri Ghizi

#### Accesare:
- Sidebar: **"Recenzii Ghizi"** → `/admin/recenzii-ghizi`
- Sau: Din meniul "Recenzii" dropdown

#### Dashboard Reviews:

```
┌────────────────────────────────────────────┐
│  Recenzii Ghizi                            │
│  [🔍 Caută...] [▼ Status: Toate]          │
│  [✓ Aprobă (2)] [🗑️ Șterge (2)]           │
├────────────────────────────────────────────┤
│  □ │ Ghid       │ ⭐ │ Review   │ Status  │
├────────────────────────────────────────────┤
│  ☑ │ Ion Pop    │ 5  │ Excepț.. │ Pending │
│     │            │    │ Data: ..  │ [✓][✗] │
├────────────────────────────────────────────┤
│  ☑ │ Maria Geo  │ 4  │ Foarte.. │ Pending │
│     │            │    │ Data: ..  │ [✓][✗] │
└────────────────────────────────────────────┘
```

#### Funcționalități:

**Filtre:**
- **Search** - Caută în ghid, titlu, comentariu
- **Status dropdown**:
  - Toate
  - În așteptare (pending)
  - Aprobate

**Bulk Actions:**
- Select multiple reviews cu checkbox
- **Aprobă (X)** - Aprobă toate selectate
- **Șterge (X)** - Șterge toate selectate (cu confirmare)

**Individual Actions:**
- ✓ **Aprobă** (verde) - Aprobă review individual
- ✗ **Respinge** (orange) - Respinge/ascunde review

**Coloane:**
- **Checkbox** - Pentru bulk select
- **Ghid** - Numele ghidului recenzat
- **Rating** - Stele (1-5)
- **Review** - Titlu + preview comentariu + data călătoriei
- **User** - Cine a lăsat review-ul
- **Data** - Când a fost postat
- **Status** - Badge (În așteptare / Aprobat)
- **Acțiuni** - Butoane aprobare/respingere

---

### 5. Ghizi Autorizați (Import CSV)

#### Accesare:
- Din dashboard ghizi: Buton **"Ghizi Autorizați"**
- Sau direct: `/admin/ghizi-autorizati`

#### Ce sunt ghizii autorizați?
- Lista oficială din **Ministerul Turismului**
- Toți ghizii cu licență activă ANT
- Import bulk via CSV
- **Nu apar automat pe site** - sunt doar pentru referință

#### Funcționalități:

**1. Import CSV:**
```
┌────────────────────────────────────┐
│  Import Ghizi Autorizați           │
│  [📤 Selectează fișier CSV]        │
│  [Import]                          │
└────────────────────────────────────┘
```

**Format CSV necesar:**
```csv
full_name,license_number,specialization,region,phone,email,license_expiry_date
Ion Popescu,ANT-123-2024,Ghid montan,Transilvania,+40712345678,ion@example.com,2025-12-31
Maria Georgescu,ANT-456-2024,Ghid cultural,București,+40723456789,maria@example.com,2026-06-30
```

**2. Tabel Ghizi Autorizați:**
```
┌────────────────────────────────────────────────┐
│  [🔍 Caută...] [▼ Regiune] [▼ Specializare]  │
├────────────────────────────────────────────────┤
│  Nume         │ Licență    │ Spec  │ Status  │
├────────────────────────────────────────────────┤
│  Ion Popescu  │ ANT-123    │ Montan│ ✓ Activ │
│  Trans        │ Exp: 12/25 │       │         │
└────────────────────────────────────────────────┘
```

**3. Export CSV:**
- Buton pentru download listă completă
- Același format ca importul

---

### 6. Workflow-uri Recomandate

#### Workflow 1: Adaugă Ghid Nou Verificat

1. **Verificare Preliminară**
   - Verifică licența ANT în tabelul "Ghizi Autorizați"
   - Confirmă identitatea și experiența

2. **Creare Profil**
   - `/admin/ghizi` → "Adaugă Ghid"
   - **Tab 1**: Completează nume, slug, imagine, bio
   - **Tab 2**: Adaugă specializări, limbi, zone
   - **Tab 3**: Info contact și prețuri
   - **Tab 4**: Asociază obiective relevante
   - **Tab 5**:
     - ✓ **Verificat** = DA
     - ✓ **Featured** = Opțional (ghizi excepționali)
     - ✓ **Activ** = DA
     - Note: "Licență ANT-123, verificat pe data..."

3. **Salvează** și verifică profilul public

#### Workflow 2: Aprobare Review-uri

1. **Verificare Zilnică**
   - `/admin/recenzii-ghizi`
   - Filtrează: "În așteptare"

2. **Review Individual**
   - Citește review-ul complet
   - Verifică:
     - ✅ Limbaj decent
     - ✅ Nu conține spam
     - ✅ Relevant pentru ghid
     - ✅ Nu este ofensator

3. **Acțiune**
   - ✓ **Aprobă** dacă este OK
   - ✗ **Respinge** dacă încalcă regulile
   - 🗑️ **Șterge** permanent dacă este spam

4. **Bulk Aprobare**
   - Pentru review-uri multiple OK
   - Select toate → "Aprobă (X)"

#### Workflow 3: Promovare Ghizi Featured

1. **Criterii Featured:**
   - Rating ≥ 4.5
   - Minimum 10 reviews
   - Profil complet (bio, imagine, specializări)
   - Experiență semnificativă
   - Disponibilitate confirmată

2. **Promovare:**
   - Edit ghid → Tab 5
   - ✓ Featured = DA
   - Salvează

3. **Featured Section:**
   - Ghizii featured apar primii în listing
   - Badge special galben "⭐ Recomandat"
   - Prioritate în sortare

---

## TROUBLESHOOTING

### Problem 1: Nu apar ghizi în listing

**Posibile cauze:**
1. Nu există ghizi în baza de date
2. Toți ghizii sunt marcați ca "Inactiv"
3. Eroare la încărcarea datelor

**Soluții:**
```
1. Verifică în admin dacă există ghizi:
   - Mergi pe /admin/ghizi
   - Verifică dacă tabelul are entries

2. Verifică status ghizi:
   - Cel puțin un ghid trebuie să fie ✓ Activ

3. Check console pentru erori:
   - F12 → Console
   - Caută erori roșii
```

### Problem 2: Formular booking nu trimite

**Verificări:**
1. **Completare câmpuri obligatorii** (marcate cu *)
2. **Format email valid** (ex: user@example.com)
3. **Format telefon valid** (ex: +40712345678)
4. **Data în viitor** (nu în trecut)

**Console Logs:**
```javascript
// Caută în Console (F12)
- "Booking request sent successfully" ✅
- Error messages în roșu ❌
```

### Problem 3: Review nu apare după trimitere

**Normal! Review-urile necesită aprobare admin.**

**Proces:**
1. User trimite review → Status: "În așteptare"
2. Admin primește notificare
3. Admin aprobă → Status: "Aprobat"
4. Acum review apare public

**Verificare admin:**
```
/admin/recenzii-ghizi → Filtrează "În așteptare"
```

### Problem 4: Imagine profil nu se încarcă

**Cauze comune:**
1. Fișier prea mare (max 2MB)
2. Format incompatibil (doar JPG, PNG)
3. Eroare upload storage

**Soluții:**
```
1. Comprimă imaginea:
   - Folosește TinyPNG sau similar
   - Recomandare: 500x500px, <500KB

2. Verifică formatul:
   - .jpg, .jpeg, .png acceptate
   - .gif, .webp NU sunt acceptate

3. Reîncarcă pagina și încearcă din nou
```

### Problem 5: Filtre nu funcționează

**Verificări:**
1. **JavaScript enabled** în browser
2. **No console errors** (F12 → Console)
3. **Refresh pagina** (Ctrl+F5)

**Debug:**
```javascript
// În Console (F12), rulează:
console.log(filters);

// Ar trebui să vezi:
{
  region: "transilvania",
  specialization: "istorie",
  // etc.
}
```

---

## ANEXE

### A. Specializări Predefinite (Complete)

```
1. Ghid Montan
2. Ghid Muzee
3. Ghid Cultural
4. Ghid Gastronomic
5. Ghid Natură
6. Ghid Urban
7. Ghid Religios
8. Ghid Istoric
9. Ghid Aventură
10. Ghid Foto
```

### B. Zone Geografice (Exemple)

```
Regiuni istorice:
- Transilvania
- Muntenia
- Moldova
- Oltenia
- Banat
- Crișana
- Maramureș
- Bucovina
- Dobrogea

Orașe majore:
- București
- Cluj-Napoca
- Brașov
- Sibiu
- Timișoara
- Iași
- Constanța
```

### C. Email Templates

**Email Confirmare Booking (trimis la user):**
```
Subject: Cerere de rezervare trimisă cu succes

Bună [Nume User],

Cererea ta de rezervare pentru ghidul [Nume Ghid] a fost trimisă cu succes.

Detalii cerere:
- Ghid: [Nume Ghid]
- Data preferată: [Data]
- Număr persoane: [Nr]
- Destinații: [Lista]

Ghidul te va contacta în 24-48 ore la:
- Email: [Email User]
- Telefon: [Telefon User]

Mulțumim,
Echipa APOT
```

**Email Notificare Admin (trimis la admin):**
```
Subject: Cerere nouă de rezervare ghid

Cerere nouă de rezervare:

Ghid: [Nume Ghid]
User: [Nume User]
Email: [Email User]
Telefon: [Telefon User]

Detalii:
- Data: [Data]
- Persoane: [Nr]
- Durată: [Zile]
- Buget: [Buget]

Vezi toate cererile:
https://apot.vercel.app/admin/mesaje-contact
```

---

## SUPORT & CONTACT

### Pentru Utilizatori:
- 📧 Email: contact@apot.ro
- 📞 Telefon: +40 XXX XXX XXX
- 💬 Chat: [Widget pe site]

### Pentru Admini:
- 📖 Documentație completă: `/docs`
- 🐛 Raportare bug: GitHub Issues
- 💡 Feature request: contact@apot.ro

---

**Versiune documentație**: 1.0.0  
**Data**: 2025-11-30  
**Status**: ✅ COMPLET
