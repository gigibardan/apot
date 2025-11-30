# APOT.RO - Documentație Proiect

## 📋 Overview

APOT (Asociația pentru Protejarea Obiectivelor Turistice) este o platformă web enterprise-grade pentru obiective turistice mondiale, construită cu Next.js 15, TypeScript, Tailwind CSS și Supabase.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ și npm
- Git

### Instalare Locală

```bash
# Clone repository
git clone <repository-url>
cd apot-ro

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

Aplicația va rula la `http://localhost:3000`

## 📁 Structura Proiectului

```
/app                    # Next.js App Router
  /(public)            # Public pages (homepage, objectives, blog)
  /(admin)             # Admin panel (protected routes)
  /auth                # Authentication pages
  /api                 # API routes

/components
  /ui                  # shadcn/ui components
  /layout              # Layout components (Header, Footer, Container)
  /providers           # React Context providers
  /features            # Feature-specific components (coming soon)

/lib
  /config              # Site configuration
  /constants           # App constants (routes, SEO)
  /utils               # Utility functions
  /supabase            # Supabase integration (coming soon)

/types                 # TypeScript type definitions
/public                # Static assets
/docs                  # Documentation
```

Pentru detalii complete, vezi [ARCHITECTURE.md](./ARCHITECTURE.md)

## 🛠️ Scripts Disponibile

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format with Prettier
npm run type-check   # TypeScript type checking
```

## 🎨 Design System

### Culori
- **Primary:** Orange-500 (#F97316)
- **Accent:** Red-600 (#DC2626)
- **Neutral:** Slate palette

### Tipografie
- **Display (headings):** Montserrat
- **Body:** Inter

### Dark Mode
Aplicația suportă dark/light/system mode prin `next-themes`.

## 🏗️ Faze de Dezvoltare

### ✅ FAZA 1 (Current)
- Setup proiect Next.js 15
- Design system fundație
- Structură foldere enterprise
- Layouts (public, admin)
- Homepage cu hero section
- Componente layout (Header, Footer, Container, Section)

### 🔄 FAZA 2 (Next)
- Integrare Supabase
- Database schema
- Authentication system
- Media upload functionality

### 📅 Faze Viitoare
- CRUD obiective turistice
- Blog management
- Advanced search & filters
- SEO optimization
- AI features
- Multi-language support

## 📚 Documentație Completă

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arhitectură detaliată
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Schema bazei de date (coming soon)
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API endpoints (coming soon)

## 🤝 Contribuții

Proiect în dezvoltare activă. Detalii despre workflow de contribuție vor fi adăugate în curând.

## 📄 License

Toate drepturile rezervate © APOT

---

**Versiune:** 1.0.0  
**Ultima actualizare:** [Data]
