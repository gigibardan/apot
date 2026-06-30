/**
 * Generator automat de FAQ pentru obiective turistice.
 *
 * Construiește o listă de întrebări-răspuns pe baza câmpurilor deja
 * existente în baza de date (preț, program, accesibilitate, UNESCO etc.).
 * Nu necesită introducere manuală -- se actualizează automat dacă se
 * modifică datele obiectivului.
 *
 * Fiecare întrebare e inclusă DOAR dacă există date reale pentru ea,
 * ca să nu generăm răspunsuri goale sau generice de tipul "N/A".
 */

import type { ObjectiveWithRelations } from "@/types/database.types";

export interface FAQItem {
  question: string;
  answer: string;
}

export function generateObjectiveFAQs(objective: ObjectiveWithRelations): FAQItem[] {
  const faqs: FAQItem[] = [];
  const name = objective.title;
  const country = objective.country?.name;

  // ── Preț / tarif intrare ──────────────────────────────────────────
  if (objective.entrance_fee) {
    faqs.push({
      question: `Cât costă intrarea la ${name}?`,
      answer: `Tariful de intrare la ${name} este ${objective.entrance_fee}.`,
    });
  }

  // ── Program ─────────────────────────────────────────────────────
  if (objective.opening_hours) {
    faqs.push({
      question: `Care este programul de vizitare pentru ${name}?`,
      answer: `${name} este deschis în următorul program: ${objective.opening_hours}.`,
    });
  }

  // ── Durată recomandată vizită ───────────────────────────────────
  if (objective.visit_duration) {
    faqs.push({
      question: `Cât durează o vizită la ${name}?`,
      answer: `O vizită completă la ${name} durează în medie ${objective.visit_duration}.`,
    });
  }

  // ── Sezon recomandat ────────────────────────────────────────────
  if (objective.best_season) {
    faqs.push({
      question: `Care este cel mai bun sezon pentru a vizita ${name}?`,
      answer: `Perioada recomandată pentru a vizita ${name} este ${objective.best_season}.`,
    });
  }

  // ── Accesibilitate ──────────────────────────────────────────────
  if (objective.accessibility_info) {
    faqs.push({
      question: `Este ${name} accesibil pentru persoane cu dizabilități?`,
      answer: objective.accessibility_info,
    });
  }

  // ── Statut UNESCO ───────────────────────────────────────────────
  if (objective.unesco_site) {
    faqs.push({
      question: `Este ${name} sit UNESCO?`,
      answer: objective.unesco_year
        ? `Da, ${name} este inclus în patrimoniul UNESCO din anul ${objective.unesco_year}.`
        : `Da, ${name} este sit din patrimoniul mondial UNESCO.`,
    });
  }

  // ── Locație / cum ajung ─────────────────────────────────────────
  if (objective.location_text && country) {
    faqs.push({
      question: `Unde este situat ${name}?`,
      answer: `${name} este situat în ${objective.location_text}, ${country}.`,
    });
  }

  return faqs;
}