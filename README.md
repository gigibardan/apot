# apot.club - Tourism Platform

## 🌍 Overview

APOT (Asociația pentru Protejarea Obiectivelor Turistice) is an enterprise-grade web platform for discovering tourist attractions worldwide. Built with React, TypeScript, Tailwind CSS, and React Router.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:8080`

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Header, Footer, Container, Section, Layouts
│   └── providers/       # ThemeProvider
├── pages/               # Page components (Home, Objectives, Blog, etc.)
├── lib/
│   ├── config/          # Site configuration
│   ├── constants/       # Routes, SEO defaults
│   └── utils.ts         # Utility functions
├── types/               # TypeScript types
└── index.css           # Design system & Tailwind
```

## 🎨 Design System

### Colors
- **Primary:** Orange `#F97316`
- **Accent:** Red `#DC2626`
- **Neutral:** Slate palette

### Typography
- **Display (headings):** Montserrat (Google Fonts)
- **Body:** Inter (Google Fonts)

### Features
- ✅ Dark/Light/System mode
- ✅ Fully responsive (mobile-first)
- ✅ Accessible (WCAG AA)
- ✅ TypeScript strict mode
- ✅ SEO optimized

## 🛠️ Tech Stack

- **Frontend:** React 18 + Vite
- **Routing:** React Router v6
- **Styling:** Tailwind CSS + shadcn/ui
- **Language:** TypeScript (strict)
- **State:** React Query
- **Theme:** next-themes

## 📝 Available Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🔄 Development Phases

### ✅ Phase 1 (Current)
- Project setup & architecture
- Design system foundation
- Layout components (Header, Footer, Container, Section)
- Public routes (Home, Objectives, Blog, About, Contact)
- Admin panel structure
- Dark mode support

### 🔄 Phase 2 (Next)
- Lovable Cloud integration
- Database schema
- Authentication system
- Media upload functionality

### 📅 Future Phases
- CRUD tourist objectives
- Blog management
- Advanced search & filters
- SEO optimization
- AI features
- Multi-language support

## 📚 Documentation

See `/docs` folder for detailed documentation:
- `README.md` - Project overview
- `ARCHITECTURE.md` - Complete architecture guide (to be added)

## 🤝 Contributing

Project in active development. Contributing guidelines coming soon.

## 📄 License

All rights reserved © APOT

---

**Version:** 1.0.0  
**Last Updated:** [Date]
