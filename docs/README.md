# APOT - Tourist Objectives Platform

## 📋 Overview

APOT (Asociația pentru Protejarea Obiectivelor Turistice) is an enterprise-grade web platform for discovering and exploring tourist objectives worldwide. Built with modern web technologies and optimized for SEO, performance, and accessibility.

## 🎯 Project Goals

- **Comprehensive Directory**: Thousands of tourist objectives (monuments, museums, natural parks, UNESCO sites)
- **SEO-First**: Optimized for Google indexing and search visibility
- **Performance**: Lightning-fast load times, excellent Core Web Vitals
- **Accessibility**: WCAG 2.1 AA compliant
- **Modern Design**: Beautiful, responsive, mobile-first interface
- **Admin CMS**: Powerful content management for non-technical users

## 🚀 Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **React Helmet Async** - Dynamic meta tags for SEO

### Backend
- **Lovable Cloud (Supabase)** - PostgreSQL database, authentication, storage
- **Edge Functions** - Serverless backend logic

### SEO & Performance
- **Vite Image Optimizer** - Automatic image optimization
- **Dynamic Sitemap** - Generated via edge function
- **Structured Data** - JSON-LD for rich snippets
- **Lazy Loading** - Code splitting and route-based chunks

## 📁 Project Structure

```
/
├── src/
│   ├── components/
│   │   ├── layout/          # Layout components (Header, Footer, Container, etc.)
│   │   ├── seo/             # SEO utilities (SEO component, meta management)
│   │   ├── shared/          # Shared components (LoadingSpinner, ThemeToggle)
│   │   ├── ui/              # shadcn/ui components
│   │   └── providers/       # React context providers
│   ├── pages/               # Route pages
│   ├── lib/
│   │   ├── config/          # Site configuration
│   │   ├── constants/       # Routes, SEO defaults
│   │   └── utils.ts         # Utility functions
│   ├── types/               # TypeScript type definitions
│   ├── integrations/        # Supabase integration
│   └── hooks/               # Custom React hooks
├── public/                  # Static assets
├── supabase/
│   └── functions/           # Edge functions (sitemap, etc.)
└── docs/                    # Documentation
```

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Installation

1. Clone the repository
```bash
git clone <repo-url>
cd apot
```

2. Install dependencies
```bash
npm install
```

3. Run development server
```bash
npm run dev
```

Open `http://localhost:8080` in your browser.

4. Build for production
```bash
npm run build
```

## 📝 Available Scripts

```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format with Prettier
npm run type-check   # TypeScript type checking
```

## 🎨 Design System

### Colors
- **Primary**: Orange (#F97316) - Main brand color
- **Accent**: Red (#DC2626) - Call-to-action, highlights
- **Neutrals**: Slate palette - Backgrounds, text, borders

### Typography
- **Headings**: Montserrat (weights: 400-900)
- **Body**: Inter (weights: 300-700)

### Spacing
- Follows 4px base unit system
- Responsive scaling via Tailwind utilities

### Dark Mode
Full dark mode support via `next-themes` (light/dark/system).

## 📊 SEO Strategy

### On-Page SEO
- Dynamic meta tags per page (title, description, OG tags)
- Canonical URLs
- Structured data (JSON-LD)
- Semantic HTML (proper heading hierarchy)
- Alt text on all images
- Clean, descriptive URLs

### Technical SEO
- Fast load times (< 2s FCP)
- Mobile-optimized (responsive design)
- Sitemap.xml (auto-generated via edge function)
- Robots.txt
- Image optimization (WebP, lazy loading)

### Performance Targets
- Lighthouse Performance: 85+
- Lighthouse SEO: 95+
- Lighthouse Accessibility: 95+
- Lighthouse Best Practices: 90+

## 🏗️ Development Phases

### ✅ Phase 1: Foundation (Current)
- ✅ Vite + React + TypeScript setup
- ✅ Lovable Cloud (Supabase) integration
- ✅ Design system with Tailwind
- ✅ SEO infrastructure (React Helmet, sitemap, structured data)
- ✅ Layout components (Header, Footer, Container, Section)
- ✅ Routing structure (public/admin/auth)
- ✅ Dark mode support
- ✅ Responsive navigation
- ✅ 404 error page

### 🔄 Phase 2: Content Management (Next)
- Database schema for objectives & blog
- Admin authentication
- CRUD operations for objectives
- Media upload & management
- Rich text editor for content

### 📅 Future Phases
- Advanced search & filters
- User favorites & collections
- Comments & ratings
- Multi-language support (i18n)
- AI-powered recommendations
- Analytics dashboard

## 🚢 Deployment

The platform deploys automatically via Lovable's hosting infrastructure. Edge functions deploy with code updates.

### Environment Variables
Required environment variables are managed through Lovable Cloud and don't need manual configuration.

## 📝 Development Guidelines

### Code Style
- TypeScript strict mode (no `any` types)
- Functional components with hooks
- Tailwind for styling (use semantic tokens)
- Semantic HTML elements
- Accessible components (ARIA labels, keyboard navigation)

### Component Patterns
- Use design system tokens from `index.css` and `tailwind.config.ts`
- Props typed with TypeScript interfaces
- Error boundaries for resilience
- Loading states for async operations
- Lazy loading for heavy components

### Naming Conventions
- Components: PascalCase
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Files: PascalCase for components, camelCase for utilities

## 🔒 Security

- RLS policies on all database tables
- CORS properly configured
- Input validation on all forms
- Secure authentication via Supabase Auth
- Environment variables for sensitive data

## 🤝 Contributing

Contributions welcome! Please:
1. Follow coding standards
2. Write meaningful commit messages
3. Test thoroughly before submitting
4. Create pull requests for review

## 📧 Contact

- **Email**: contact@apot.ro
- **Website**: https://apot.ro

## 📄 License

Copyright © 2025 APOT. All rights reserved.

---

**Version:** 1.0.0  
**Last Updated:** 2025-01-30
