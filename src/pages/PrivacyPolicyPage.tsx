import { SEO } from '@/components/seo/SEO';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { siteConfig } from '@/lib/config/site.config';

export default function PrivacyPolicyPage() {
  return (
    <>
      <SEO
        title="Politica de Confidențialitate"
        description="Află cum colectăm, folosim și protejăm datele tale personale pe platforma APOT."
      />
      
      <Section>
        <Container>
          <div className="max-w-4xl mx-auto prose prose-slate dark:prose-invert">
            <h1>Politica de Confidențialitate</h1>
            <p className="lead">
              Ultima actualizare: {new Date().toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <h2>1. Introducere</h2>
            <p>
              Bun venit pe {siteConfig.fullName} ("noi", "site-ul" sau "platforma"). 
              Ne angajăm să protejăm confidențialitatea și datele personale ale utilizatorilor noștri 
              în conformitate cu Regulamentul General privind Protecția Datelor (GDPR) și legislația 
              română în vigoare.
            </p>
            <p>
              Această politică de confidențialitate explică ce date personale colectăm, cum le folosim, 
              cu cine le partajăm și care sunt drepturile tale.
            </p>

            <h2>2. Operatorul de Date</h2>
            <p>
              Operatorul de date personale este {siteConfig.fullName}, cu sediul în România.
            </p>
            <p>
              Pentru orice întrebări legate de prelucrarea datelor personale, ne poți contacta la:
            </p>
            <ul>
              <li>Email: {siteConfig.contact.email}</li>
              <li>Telefon: {siteConfig.contact.phone}</li>
            </ul>

            <h2>3. Ce Date Personale Colectăm</h2>
            
            <h3>3.1 Date furnizate direct de tine:</h3>
            <ul>
              <li><strong>Date de cont:</strong> nume, adresă de email, parolă (criptată)</li>
              <li><strong>Date de profil:</strong> fotografie de profil, biografie, locație</li>
              <li><strong>Conținut generat:</strong> recenzii, comentarii, postări pe forum, jurnale de călătorie</li>
              <li><strong>Comunicări:</strong> mesaje trimise prin formularul de contact, cereri de rezervare</li>
            </ul>

            <h3>3.2 Date colectate automat:</h3>
            <ul>
              <li><strong>Date tehnice:</strong> adresa IP, tipul de browser, sistemul de operare, rezoluția ecranului</li>
              <li><strong>Date de utilizare:</strong> paginile vizitate, timpul petrecut pe site, acțiunile efectuate</li>
              <li><strong>Cookie-uri:</strong> identificatori unici pentru sesiune și preferințe (vezi Politica de Cookies)</li>
            </ul>

            <h2>4. Scopurile Prelucrării</h2>
            <p>Folosim datele tale personale pentru:</p>
            <ul>
              <li><strong>Furnizarea serviciilor:</strong> crearea și gestionarea contului, afișarea conținutului personalizat</li>
              <li><strong>Comunicare:</strong> răspunsuri la întrebări, notificări despre cont, newsletter (cu consimțământ)</li>
              <li><strong>Îmbunătățirea platformei:</strong> analize statistice anonimizate, detectarea problemelor tehnice</li>
              <li><strong>Securitate:</strong> prevenirea fraudelor, protecția împotriva atacurilor</li>
              <li><strong>Obligații legale:</strong> conformarea cu cerințele legale și fiscale</li>
            </ul>

            <h2>5. Temeiul Legal al Prelucrării</h2>
            <ul>
              <li><strong>Consimțământ:</strong> pentru newsletter, cookie-uri opționale, comunicări de marketing</li>
              <li><strong>Executarea contractului:</strong> pentru furnizarea serviciilor solicitate</li>
              <li><strong>Interes legitim:</strong> pentru îmbunătățirea platformei și securitate</li>
              <li><strong>Obligații legale:</strong> pentru conformarea cu legea</li>
            </ul>

            <h2>6. Partajarea Datelor</h2>
            <p>Nu vindem datele tale personale. Le putem partaja cu:</p>
            <ul>
              <li><strong>Furnizori de servicii:</strong> hosting, email, analize (cu acorduri de confidențialitate)</li>
              <li><strong>Autorități:</strong> când legea o cere</li>
              <li><strong>Alți utilizatori:</strong> conținutul public (recenzii, postări forum) este vizibil altora</li>
            </ul>

            <h2>7. Transferuri Internaționale</h2>
            <p>
              Unii furnizori de servicii pot prelucra date în afara UE/SEE. În aceste cazuri, 
              ne asigurăm că există garanții adecvate (clauze contractuale standard, certificări).
            </p>

            <h2>8. Păstrarea Datelor</h2>
            <ul>
              <li><strong>Date de cont:</strong> până la ștergerea contului + 30 zile pentru backup</li>
              <li><strong>Conținut generat:</strong> atât timp cât contul este activ</li>
              <li><strong>Date tehnice/logs:</strong> maximum 12 luni</li>
              <li><strong>Date de facturare:</strong> conform cerințelor legale (10 ani)</li>
            </ul>

            <h2>9. Drepturile Tale</h2>
            <p>Conform GDPR, ai următoarele drepturi:</p>
            <ul>
              <li><strong>Dreptul de acces:</strong> poți solicita o copie a datelor tale</li>
              <li><strong>Dreptul la rectificare:</strong> poți corecta datele incorecte</li>
              <li><strong>Dreptul la ștergere:</strong> poți solicita ștergerea datelor</li>
              <li><strong>Dreptul la restricționare:</strong> poți limita prelucrarea</li>
              <li><strong>Dreptul la portabilitate:</strong> poți primi datele în format electronic</li>
              <li><strong>Dreptul de opoziție:</strong> poți te opune prelucrării în anumite cazuri</li>
              <li><strong>Dreptul de retragere a consimțământului:</strong> oricând, fără a afecta legalitatea prelucrării anterioare</li>
            </ul>
            <p>
              Pentru a-ți exercita drepturile, contactează-ne la {siteConfig.contact.email}. 
              Vom răspunde în maximum 30 de zile.
            </p>

            <h2>10. Securitatea Datelor</h2>
            <p>Implementăm măsuri tehnice și organizatorice pentru protecția datelor:</p>
            <ul>
              <li>Criptare SSL/TLS pentru toate conexiunile</li>
              <li>Parole criptate cu algoritmi siguri</li>
              <li>Acces restricționat la date pe baza necesității</li>
              <li>Monitorizare continuă a securității</li>
              <li>Backup-uri regulate și criptate</li>
            </ul>

            <h2>11. Date ale Minorilor</h2>
            <p>
              Site-ul nu este destinat persoanelor sub 16 ani. Nu colectăm intenționat 
              date de la minori. Dacă ești părinte și afli că copilul tău ne-a furnizat 
              date, contactează-ne pentru ștergere.
            </p>

            <h2>12. Modificări ale Politicii</h2>
            <p>
              Putem actualiza această politică periodic. Te vom notifica despre modificări 
              semnificative prin email sau prin afișarea unui aviz pe site.
            </p>

            <h2>13. Plângeri</h2>
            <p>
              Dacă consideri că prelucrăm datele tale necorespunzător, ai dreptul să depui 
              o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu 
              Caracter Personal (ANSPDCP):
            </p>
            <ul>
              <li>Website: <a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer">www.dataprotection.ro</a></li>
              <li>Email: anspdcp@dataprotection.ro</li>
            </ul>

            <h2>14. Contact</h2>
            <p>
              Pentru orice întrebări sau solicitări legate de această politică sau de 
              datele tale personale, ne poți contacta:
            </p>
            <ul>
              <li>Email: {siteConfig.contact.email}</li>
              <li>Telefon: {siteConfig.contact.phone}</li>
              <li>Formular de contact: <a href="/contact">/contact</a></li>
            </ul>
          </div>
        </Container>
      </Section>
    </>
  );
}
