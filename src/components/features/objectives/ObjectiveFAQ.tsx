import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FAQItem } from "@/lib/utils/objective-faq";
import { generateFAQSchema } from "@/lib/utils/structured-data";

interface ObjectiveFAQProps {
  faqs: FAQItem[];
}

/**
 * Secțiune FAQ vizibilă + structured data FAQPage.
 *
 * Două motive pentru asta, nu doar unul:
 * 1. Google poate afișa rich snippets expandabile direct în rezultatele
 *    de căutare (din JSON-LD structured data).
 * 2. Motoarele AI (ChatGPT, Perplexity, Google AI Overviews) extrag de
 *    obicei răspunsuri din TEXT VIZIBIL în format întrebare-răspuns, nu
 *    doar din markup ascuns -- de-asta FAQ-ul trebuie să fie randat ca
 *    text normal pe pagină, nu doar ca JSON-LD invizibil.
 *
 * Dacă nu există nicio întrebare generată (lipsesc date), componenta nu
 * randează nimic -- nu afișăm o secțiune goală.
 */
export function ObjectiveFAQ({ faqs }: ObjectiveFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (faqs.length === 0) return null;

  const faqSchema = generateFAQSchema(faqs);

  return (
    <section>
      <h2 className="text-2xl md:text-3xl font-display font-bold mb-6">
        Întrebări Frecvente
      </h2>

      {/* Structured Data pentru rich snippets Google */}
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>

      {/* FAQ vizibil -- text real, citibil de motoare AI */}
      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="rounded-lg border bg-card overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between gap-4 p-4 text-left font-medium hover:bg-muted/50 transition-colors"
                aria-expanded={isOpen}
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {/* Răspunsul rămâne în DOM (doar ascuns vizual) pentru ca
                  Google și AI-urile să-l poată citi, chiar dacă userul
                  nu a dat click să-l expandeze */}
              <div
                className={`px-4 text-muted-foreground leading-relaxed ${
                  isOpen ? "pb-4" : "max-h-0 overflow-hidden"
                }`}
              >
                {faq.answer}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}