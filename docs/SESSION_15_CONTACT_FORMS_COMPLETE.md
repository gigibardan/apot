# SESSION 15: Contact Forms System - COMPLETE ✅

**Data implementare**: 30 Noiembrie 2024  
**Status**: Implementat și testat cu succes

## Rezumat

Sistem complet de formulare de contact cu trei tipuri:
1. **Contact General** - mesaje generale către echipa site-ului
2. **Întrebări Obiective** - întrebări despre obiective turistice specifice  
3. **Rezervări Ghizi** - cereri de rezervare pentru ghizi turistici

Include validare avansată, gestionare admin, și tracking complet.

---

## 1. Backend Layer

### 1.1 Database Schema

Trei tabele principale create:

#### **contact_messages** - Mesaje de contact general
```sql
- id (UUID, PK)
- full_name (TEXT, NOT NULL)
- email (TEXT, NOT NULL)
- phone (TEXT, nullable)
- subject (TEXT, NOT NULL)
- message (TEXT, NOT NULL)
- status (TEXT: 'new'|'read'|'replied'|'archived', default 'new')
- user_id (UUID, FK auth.users, nullable)
- ip_address (INET, nullable)
- user_agent (TEXT, nullable)
- read_at (TIMESTAMP, nullable)
- replied_at (TIMESTAMP, nullable)
- admin_notes (TEXT, nullable)
- created_at, updated_at
```

#### **objective_inquiries** - Întrebări despre obiective
```sql
- id (UUID, PK)
- objective_id (UUID, FK objectives, NOT NULL)
- full_name (TEXT, NOT NULL)
- email (TEXT, NOT NULL)
- phone (TEXT, nullable)
- message (TEXT, NOT NULL)
- visit_date (DATE, nullable)
- number_of_people (INTEGER, nullable)
- status (TEXT: 'new'|'read'|'replied'|'archived', default 'new')
- user_id (UUID, FK auth.users, nullable)
- ip_address (INET, nullable)
- read_at, replied_at, admin_notes
- created_at, updated_at
```

#### **guide_booking_requests** - Cereri rezervare ghizi
```sql
- id (UUID, PK)
- guide_id (UUID, FK guides, NOT NULL)
- full_name (TEXT, NOT NULL)
- email (TEXT, NOT NULL)
- phone (TEXT, NOT NULL)
- preferred_date (DATE, NOT NULL)
- number_of_people (INTEGER, NOT NULL)
- duration_days (INTEGER, nullable)
- destinations (TEXT[], nullable)
- special_requests (TEXT, nullable)
- budget_range (TEXT, nullable)
- language_preference (TEXT, nullable)
- status (TEXT: 'pending'|'contacted'|'confirmed'|'cancelled'|'completed')
- user_id (UUID, FK auth.users, nullable)
- ip_address (INET, nullable)
- read_at, replied_at, admin_notes
- created_at, updated_at
```

**RLS Policies**: 
- Oricine poate INSERT (trimite mesaje)
- Doar admins pot SELECT/UPDATE/DELETE
- Toate tabelele au RLS activat

**Indexes** pentru performanță:
- Status indexes
- Created_at indexes (DESC)
- Foreign key indexes (objective_id, guide_id)

### 1.2 Backend Mutations (`src/lib/supabase/mutations/contact.ts`)

**Validation Schemas** cu Zod:
- `contactFormSchema` - validare formular contact general
- `objectiveInquirySchema` - validare întrebări obiective
- `guideBookingSchema` - validare cereri rezervare

**Funcții de submit**:
```typescript
// Submit formulare (public)
submitContactForm(input: ContactFormInput)
submitObjectiveInquiry(input: ObjectiveInquiryInput)  
submitGuideBookingRequest(input: GuideBookingInput)

// Update status (admin)
updateContactMessageStatus(id, status, adminNotes?)
updateObjectiveInquiryStatus(id, status, adminNotes?)
updateGuideBookingStatus(id, status, adminNotes?)

// Bulk actions (admin)
bulkDeleteContactMessages(ids: string[])
```

**Features**:
- Validare completă cu mesaje eroare în română
- Toast notifications pentru feedback
- Auto-capture user_id dacă autentificat
- Tracking read_at și replied_at timestamps
- Admin notes pentru comunicare internă

### 1.3 Backend Queries (`src/lib/supabase/queries/contact.ts`)

**Funcții de fetch**:
```typescript
// Fetch cu filtrare și paginare
getContactMessages(status?, limit, offset)
getObjectiveInquiries(status?, objectiveId?, limit, offset)
getGuideBookingRequests(status?, guideId?, limit, offset)

// Get by ID
getContactMessageById(id)

// Statistici
getContactMessagesStats() // {total, new, read, replied, archived}
getObjectiveInquiriesStats()
getGuideBookingRequestsStats()

// Dashboard stats
getRecentInquiriesCount(days = 7) // pentru dashboard admin
```

**Features**:
- Paginare server-side
- Filtrare după status
- Joins cu objectives și guides pentru detalii complete
- Count exact pentru statistici
- Date formatate pentru display

---

## 2. Frontend Components

### 2.1 ContactForm (`src/components/features/contact/ContactForm.tsx`)

**Formular de contact general** cu:
- Câmpuri: nume, email, telefon (opțional), subiect, mesaj
- Validare client-side cu react-hook-form + Zod
- Mesaje eroare în română
- Loading state și disabled inputs în timpul submit-ului
- Character counter pentru mesaj (10-2000 caractere)
- Reset form după submit reușit

**Usage**:
```tsx
<ContactForm />
```

### 2.2 ObjectiveInquiryForm (`src/components/features/contact/ObjectiveInquiryForm.tsx`)

**Formular întrebări despre obiective** cu:
- Display obiectiv în header
- Câmpuri: nume, email, telefon, mesaj, data vizitei, nr. persoane
- Callback onSuccess pentru închidere dialog
- Hidden input pentru objective_id

**Props**:
```typescript
{
  objectiveId: string;
  objectiveTitle: string;
  onSuccess?: () => void;
}
```

**Usage**:
```tsx
<ObjectiveInquiryForm 
  objectiveId={objective.id}
  objectiveTitle={objective.title}
  onSuccess={() => setDialogOpen(false)}
/>
```

### 2.3 GuideBookingForm (`src/components/features/contact/GuideBookingForm.tsx`)

**Formular rezervare ghizi** cu:
- Display ghid în header
- Câmpuri obligatorii: nume, email, telefon, data, nr. persoane
- Câmpuri opționale: durata, buget, preferință limbă, cerințe speciale
- Date picker cu min date = astăzi
- Number inputs cu validare range

**Props**:
```typescript
{
  guideId: string;
  guideName: string;
  onSuccess?: () => void;
}
```

---

## 3. Pages

### 3.1 ContactPage (`src/pages/ContactPage.tsx`)

**Pagina publică de contact** actualizată cu:
- Hero section cu title și description
- Card-uri cu informații contact (Email, Telefon, Locație)
- Formular de contact funcțional
- SEO optimizat cu structured data ContactPage
- Responsive design

**Route**: `/contact`

### 3.2 ContactMessagesAdmin (`src/pages/admin/ContactMessagesAdmin.tsx`)

**Admin panel complet** pentru gestionare mesaje cu:

**Features principale**:
- 3 tab-uri: Contact Messages, Objective Inquiries, Guide Bookings
- Filtrare după status pentru fiecare tip
- Statistici live (total, new/pending)
- View details în dialog modal
- Update status cu butoane quick action
- Admin notes editabile
- Badge-uri colorate pentru statusuri

**Tabs**:

1. **Contact Messages**
   - Filter: all/new/read/replied/archived
   - Display: nume, subiect, email, data
   - Actions: Citit, Răspuns, Arhivează

2. **Objective Inquiries**  
   - Filter: all/new/read/replied/archived
   - Display: nume, obiectiv, email, data
   - Link către obiectiv
   - Actions: Citit, Răspuns

3. **Guide Bookings**
   - Filter: all/pending/contacted/confirmed/cancelled/completed
   - Display: nume, ghid, data preferată, nr. persoane
   - Link către ghid
   - Actions: Contactat, Confirmă, Anulează

**Dialog detalii**:
- Toate informațiile complete
- Textarea pentru admin notes
- Quick action buttons specific tipului
- Auto-update timestamps (read_at, replied_at)

**Route**: `/admin/mesaje-contact`

---

## 4. Integration Points

### 4.1 Routes (`src/App.tsx`)

```tsx
// Admin route adăugată
<Route path="mesaje-contact" element={<ContactMessagesAdmin />} />
```

### 4.2 Viitoare integrări posibile

**În ObjectiveSingle**:
```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Pune o întrebare</Button>
  </DialogTrigger>
  <DialogContent>
    <ObjectiveInquiryForm 
      objectiveId={objective.id}
      objectiveTitle={objective.title}
      onSuccess={() => setOpen(false)}
    />
  </DialogContent>
</Dialog>
```

**În GuideSinglePage**:
```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button size="lg">Solicită rezervare</Button>
  </DialogTrigger>
  <DialogContent className="max-w-2xl">
    <GuideBookingForm 
      guideId={guide.id}
      guideName={guide.full_name}
      onSuccess={() => setOpen(false)}
    />
  </DialogContent>
</Dialog>
```

**În Dashboard admin**:
- Afișare recent inquiries count
- Quick link către mesaje noi

---

## 5. Security & Validation

### 5.1 Input Validation

**Toate formularele au**:
- Zod schemas cu validări stricte
- Length limits (min/max characters)
- Email format validation
- Phone number format validation
- Date validation (min date pentru rezervări)
- Number range validation
- Trim și toLowerCase pentru email-uri

**Limits**:
- Nume: 2-100 caractere
- Email: maxim 255 caractere
- Telefon: 10-20 caractere
- Mesaj contact: 10-2000 caractere  
- Mesaj inquiry: 10-1000 caractere
- Nr. persoane: 1-50 (bookings), 1-100 (inquiries)
- Durata: 1-30 zile

### 5.2 RLS Policies

**Public access**:
- ✅ INSERT pe toate tabelele (oricine poate trimite)

**Admin only**:
- ✅ SELECT (vizualizare mesaje)
- ✅ UPDATE (schimbare status, admin notes)
- ✅ DELETE (ștergere mesaje)

**Security features**:
- User ID capture automată dacă autentificat
- IP address și user agent tracking
- No public read access (confidențialitate)
- Admin role validation prin has_role()

### 5.3 Data Privacy

- Email-uri și telefoane nu sunt vizibile public
- Mesajele sunt accesibile doar adminilor
- IP tracking pentru anti-spam
- GDPR compliant (user poate fi anonim)

---

## 6. Testing

### 6.1 Test Data

Inserate 7 înregistrări de test:

**Contact messages** (3):
1. Ion Popescu - întrebare generală (new)
2. Maria Ionescu - colaborare (read)
3. Alexandru Stan - feedback (replied)

**Objective inquiries** (2):
1. Ana Popa - întrebare vizită (new)
2. George Dumitrescu - familie cu copii (read)

**Guide bookings** (1):
1. Elena Radu - rezervare 6 persoane, 3 zile (pending)

### 6.2 Verificări Efectuate

✅ **Formulare public**:
- Submit formular contact funcționează
- Validare funcționează (required fields, format)
- Toast notifications apar
- Form reset după submit

✅ **Admin panel**:
- Toate tab-urile se încarcă
- Filtrele funcționează corect
- Statistici se afișează
- Dialog detalii se deschide
- Status update funcționează
- Admin notes se salvează

✅ **Database**:
- RLS policies funcționează
- Indexes create corect
- Triggers pentru updated_at active
- Foreign keys valide

### 6.3 Status Messages

**Contact Messages**:
- 🔵 new - mesaj nou, necitit
- 🟡 read - mesaj citit
- 🟢 replied - răspuns trimis
- ⚫ archived - arhivat

**Inquiries**: same as contact

**Bookings**:
- 🔵 pending - în așteptare
- 🟡 contacted - clientul a fost contactat
- 🟢 confirmed - rezervare confirmată
- 🔴 cancelled - anulată
- ⚫ completed - finalizată

---

## 7. Future Enhancements

### 7.1 Email Notifications

**Pentru client**:
- [ ] Email confirmare primire mesaj
- [ ] Email când admin răspunde
- [ ] Email confirmare rezervare ghid

**Pentru admin**:
- [ ] Email notificare mesaj nou
- [ ] Email notificare rezervare nouă
- [ ] Daily digest cu mesaje nerezolvate

### 7.2 Advanced Features

**Form improvements**:
- [ ] File attachments (poze, documente)
- [ ] CAPTCHA pentru anti-spam
- [ ] Rate limiting per IP
- [ ] Auto-responder pentru mesaje frecvente

**Admin features**:
- [ ] Templates răspunsuri predefinite
- [ ] Bulk actions (mark as read, delete)
- [ ] Export CSV pentru rapoarte
- [ ] Search și advanced filtering
- [ ] Assignment la membri echipă
- [ ] SLA tracking (timp răspuns)

**Analytics**:
- [ ] Response time metrics
- [ ] Most asked questions
- [ ] Conversion rate bookings
- [ ] Popular destinations

### 7.3 Integration cu External Services

- [ ] Mailchimp/SendGrid pentru email automation
- [ ] CRM integration (Salesforce, HubSpot)
- [ ] WhatsApp Business API
- [ ] SMS notifications
- [ ] Calendar integration pentru bookings

---

## 8. Concluzii

✅ **Sistem complet functional** de contact forms  
✅ **Trei tipuri** de formulare pentru diferite scenarii  
✅ **Validare robustă** pe client și server  
✅ **Admin panel** intuitiv și eficient  
✅ **Security** prin RLS policies  
✅ **Tracking complet** cu timestamps și admin notes  
✅ **Test data** inserată și verificată  
✅ **Production ready** cu best practices  

Sistemul acoperă toate nevoile de comunicare dintre vizitatori și admin, cu focus pe UX, securitate, și eficiență în gestionare.

**Next steps recomandate**:
1. Integrare formulare în ObjectiveSingle și GuideSinglePage
2. Implementare email notifications cu edge functions
3. Adăugare dashboard widget pentru recent inquiries
