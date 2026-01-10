import { SEO } from "@/components/seo/SEO";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ContestTerms() {
  return (
    <>
      <SEO
        title="Termeni și Condiții - Concursuri Foto"
        description="Termeni și condițiile de participare la concursurile foto APOT"
      />

      <Section className="py-8">
        <Container className="max-w-3xl">
          <Link to="/contests" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Înapoi la Concursuri
          </Link>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">
                Termeni și Condiții - Concursuri Foto
              </CardTitle>
              <p className="text-muted-foreground">
                Ultima actualizare: Ianuarie 2025
              </p>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <h2>1. Eligibilitate</h2>
              <ul>
                <li>Concursurile sunt deschise tuturor utilizatorilor înregistrați pe platforma APOT.ro</li>
                <li>Participanții trebuie să aibă vârsta minimă de 18 ani sau acordul părinților/tutorilor legali</li>
                <li>Fiecare participant poate trimite o singură fotografie per concurs</li>
                <li>Angajații și colaboratorii APOT.ro nu pot participa la concursuri</li>
              </ul>

              <h2>2. Drepturile de Autor</h2>
              <ul>
                <li>Participantul declară că este autorul original al fotografiei trimise</li>
                <li>Participantul deține toate drepturile de proprietate intelectuală asupra imaginii</li>
                <li>Fotografia nu conține materiale protejate de drepturi de autor aparținând terților</li>
                <li>Dacă în fotografie apar persoane identificabile, participantul a obținut acordul acestora</li>
              </ul>

              <h2>3. Licențiere și Utilizare</h2>
              <p>Prin participarea la concurs, acordați APOT.ro o licență non-exclusivă, gratuită și perpetuă pentru:</p>
              <ul>
                <li>Afișarea fotografiei pe site-ul apot.ro și canalele social media</li>
                <li>Utilizarea în materiale promoționale pentru concursuri viitoare</li>
                <li>Includerea în galerii și colecții tematice</li>
              </ul>
              <p>
                <strong>Important:</strong> Veți fi întotdeauna creditat ca autor al fotografiei.
              </p>

              <h2>4. Criterii de Descalificare</h2>
              <p>O fotografie poate fi descalificată dacă:</p>
              <ul>
                <li>Nu este originală sau încalcă drepturile de autor ale altcuiva</li>
                <li>Conține conținut ofensator, vulgar sau ilegal</li>
                <li>A fost generată folosind AI (inteligență artificială)</li>
                <li>A fost editată excesiv, denaturând realitatea (excepție: ajustări minore de culoare, contrast, decupare)</li>
                <li>A câștigat deja în alte concursuri majore</li>
                <li>Nu respectă tema concursului</li>
              </ul>

              <h2>5. Procesul de Verificare</h2>
              <ul>
                <li>Toate fotografiile sunt verificate de echipa APOT.ro înainte de a fi publicate</li>
                <li>Verificarea durează de obicei 24-48 de ore</li>
                <li>Putem solicita dovezi suplimentare privind autenticitatea fotografiei (fișier RAW, metadate EXIF)</li>
                <li>Decizia echipei de moderare este finală</li>
              </ul>

              <h2>6. Votare și Câștigători</h2>
              <ul>
                <li>Votarea este deschisă tuturor utilizatorilor înregistrați</li>
                <li>Fiecare utilizator poate vota o singură fotografie per concurs</li>
                <li>Voturile multiple sau frauduloase vor fi eliminate</li>
                <li>Câștigătorii sunt determinați în funcție de numărul de voturi primite</li>
                <li>În caz de egalitate, echipa APOT.ro va decide câștigătorul</li>
              </ul>

              <h2>7. Premii</h2>
              <ul>
                <li>Premiile sunt anunțate pentru fiecare concurs în parte</li>
                <li>Câștigătorii vor fi contactați prin email în termen de 7 zile de la încheierea concursului</li>
                <li>Premiile nu pot fi schimbate cu echivalentul în bani (cu excepția cazului în care se specifică altfel)</li>
                <li>Nerevendicarea premiului în 30 de zile duce la pierderea acestuia</li>
              </ul>

              <h2>8. Confidențialitate</h2>
              <p>
                Datele personale ale participanților sunt procesate conform{" "}
                <Link to="/politica-confidentialitate" className="text-primary hover:underline">
                  Politicii de Confidențialitate
                </Link>{" "}
                a APOT.ro.
              </p>

              <h2>9. Modificări</h2>
              <p>
                APOT.ro își rezervă dreptul de a modifica acești termeni și condiții. 
                Participanții vor fi notificați despre orice modificări majore.
              </p>

              <h2>10. Contact</h2>
              <p>
                Pentru întrebări legate de concursuri, ne puteți contacta la{" "}
                <a href="mailto:contact@apot.ro" className="text-primary hover:underline">
                  contact@apot.ro
                </a>
              </p>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <Link to="/contests">
              <Button size="lg">
                Înapoi la Concursuri
              </Button>
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}
