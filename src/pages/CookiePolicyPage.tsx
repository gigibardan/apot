import { SEO } from '@/components/seo/SEO';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/lib/config/site.config';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { Settings } from 'lucide-react';

export default function CookiePolicyPage() {
  const { openSettings } = useCookieConsent();

  return (
    <>
      <SEO
        title="Politica de Cookies"
        description="Informații despre cookie-urile folosite pe platforma APOT și cum le poți gestiona."
      />
      
      <Section>
        <Container>
          <div className="max-w-4xl mx-auto prose prose-slate dark:prose-invert">
            <h1>Politica de Cookies</h1>
            <p className="lead">
              Ultima actualizare: {new Date().toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <div className="not-prose mb-8">
              <Button onClick={openSettings} className="gap-2">
                <Settings className="h-4 w-4" />
                Gestionează preferințele cookie
              </Button>
            </div>

            <h2>1. Ce sunt Cookie-urile?</h2>
            <p>
              Cookie-urile sunt fișiere text mici stocate pe dispozitivul tău când vizitezi 
              un site web. Acestea permit site-ului să îți "amintească" preferințele și 
              acțiunile (cum ar fi autentificarea, limba, dimensiunea fontului) pe o 
              perioadă de timp.
            </p>

            <h2>2. De ce folosim Cookie-uri?</h2>
            <p>Folosim cookie-uri pentru:</p>
            <ul>
              <li>A te menține autentificat pe parcursul vizitei</li>
              <li>A-ți salva preferințele (limbă, temă)</li>
              <li>A înțelege cum este folosit site-ul pentru a-l îmbunătăți</li>
              <li>A afișa conținut relevant</li>
            </ul>

            <h2>3. Tipuri de Cookie-uri Folosite</h2>

            <h3>3.1 Cookie-uri Strict Necesare</h3>
            <p>
              Acestea sunt esențiale pentru funcționarea site-ului. Fără ele, nu ai 
              putea folosi funcționalitățile de bază. <strong>Nu pot fi dezactivate.</strong>
            </p>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Nume</th>
                    <th>Scop</th>
                    <th>Durată</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>sb-*-auth-token</td>
                    <td>Autentificare și sesiune utilizator</td>
                    <td>Sesiune / 7 zile</td>
                  </tr>
                  <tr>
                    <td>cookie_consent</td>
                    <td>Salvează alegerea ta privind cookie-urile</td>
                    <td>1 an</td>
                  </tr>
                  <tr>
                    <td>cookie_preferences</td>
                    <td>Preferințele tale detaliate pentru cookie-uri</td>
                    <td>1 an</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>3.2 Cookie-uri Funcționale</h3>
            <p>
              Permit funcționalități avansate și personalizare. Site-ul funcționează 
              și fără ele, dar experiența poate fi mai puțin plăcută.
            </p>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Nume</th>
                    <th>Scop</th>
                    <th>Durată</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>theme</td>
                    <td>Preferința de temă (luminoasă/întunecată)</td>
                    <td>1 an</td>
                  </tr>
                  <tr>
                    <td>i18nextLng</td>
                    <td>Limba preferată</td>
                    <td>1 an</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>3.3 Cookie-uri Analitice</h3>
            <p>
              Ne ajută să înțelegem cum este folosit site-ul. Datele sunt anonimizate 
              sau agregate pentru statistici.
            </p>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Nume</th>
                    <th>Scop</th>
                    <th>Durată</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>_analytics_session</td>
                    <td>Identificare sesiune pentru analiză</td>
                    <td>Sesiune</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>3.4 Cookie-uri de Marketing</h3>
            <p>
              În prezent, nu folosim cookie-uri de marketing sau publicitate. 
              Dacă vom implementa în viitor, această politică va fi actualizată.
            </p>

            <h2>4. Cookie-uri ale Terților</h2>
            <p>
              Anumite servicii terțe integrate în site pot seta propriile cookie-uri:
            </p>
            <ul>
              <li><strong>Supabase:</strong> Pentru autentificare și funcționalități backend</li>
            </ul>

            <h2>5. Cum să Gestionezi Cookie-urile</h2>

            <h3>5.1 Prin Site-ul Nostru</h3>
            <p>
              Poți gestiona preferințele de cookie oricând apăsând butonul de mai jos 
              sau din banner-ul care apare la prima vizită:
            </p>
            <div className="not-prose my-4">
              <Button variant="outline" onClick={openSettings} className="gap-2">
                <Settings className="h-4 w-4" />
                Deschide setările cookie
              </Button>
            </div>

            <h3>5.2 Prin Browser</h3>
            <p>
              Poți configura browser-ul să blocheze sau să șteargă cookie-urile. 
              Iată link-uri pentru principalele browsere:
            </p>
            <ul>
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
              <li><a href="https://support.microsoft.com/help/17442/windows-internet-explorer-delete-manage-cookies" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
            </ul>
            <p>
              <strong>Atenție:</strong> Blocarea tuturor cookie-urilor poate afecta 
              funcționarea site-ului.
            </p>

            <h2>6. Actualizări ale Politicii</h2>
            <p>
              Putem actualiza această politică pentru a reflecta schimbări în utilizarea 
              cookie-urilor. Data ultimei actualizări este afișată în partea de sus.
            </p>

            <h2>7. Contact</h2>
            <p>
              Pentru întrebări despre cookie-uri sau această politică:
            </p>
            <ul>
              <li>Email: {siteConfig.contact.email}</li>
              <li>Formular de contact: <a href="/contact">/contact</a></li>
            </ul>

            <h2>8. Mai Multe Informații</h2>
            <p>
              Pentru mai multe informații despre cookie-uri și GDPR:
            </p>
            <ul>
              <li><a href="https://www.allaboutcookies.org/" target="_blank" rel="noopener noreferrer">All About Cookies</a></li>
              <li><a href="https://www.dataprotection.ro/" target="_blank" rel="noopener noreferrer">ANSPDCP - Autoritatea Națională de Supraveghere</a></li>
              <li><a href="/politica-confidentialitate">Politica noastră de Confidențialitate</a></li>
            </ul>
          </div>
        </Container>
      </Section>
    </>
  );
}
