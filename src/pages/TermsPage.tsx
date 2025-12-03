import { SEO } from '@/components/seo/SEO';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { siteConfig } from '@/lib/config/site.config';

export default function TermsPage() {
  return (
    <>
      <SEO
        title="Termeni și Condiții"
        description="Termenii și condițiile de utilizare a platformei APOT - reguli, responsabilități și drepturi."
      />
      
      <Section>
        <Container>
          <div className="max-w-4xl mx-auto prose prose-slate dark:prose-invert">
            <h1>Termeni și Condiții</h1>
            <p className="lead">
              Ultima actualizare: {new Date().toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <h2>1. Acceptarea Termenilor</h2>
            <p>
              Prin accesarea și utilizarea site-ului {siteConfig.fullName} ("Platforma", "Site-ul", "noi"), 
              accepți să fii obligat de acești Termeni și Condiții. Dacă nu ești de acord cu 
              oricare dintre acești termeni, te rugăm să nu utilizezi site-ul.
            </p>

            <h2>2. Descrierea Serviciilor</h2>
            <p>{siteConfig.fullName} oferă:</p>
            <ul>
              <li>Informații despre obiective turistice din întreaga lume</li>
              <li>Ghizi turistici și servicii de rezervare</li>
              <li>Blog cu articole de călătorie</li>
              <li>Comunitate de călători (forum, jurnale, concursuri)</li>
              <li>Sistem de recenzii și recomandări</li>
            </ul>

            <h2>3. Conturi de Utilizator</h2>
            
            <h3>3.1 Înregistrare</h3>
            <p>
              Pentru a accesa anumite funcționalități, trebuie să îți creezi un cont. 
              Te angajezi să furnizezi informații corecte și complete.
            </p>

            <h3>3.2 Securitatea Contului</h3>
            <p>
              Ești responsabil pentru păstrarea confidențialității parolei și pentru 
              toate activitățile de pe contul tău. Notifică-ne imediat în caz de 
              utilizare neautorizată.
            </p>

            <h3>3.3 Încetarea Contului</h3>
            <p>
              Poți șterge contul oricând din setări. Ne rezervăm dreptul de a suspenda 
              sau șterge conturi care încalcă acești termeni.
            </p>

            <h2>4. Conținut Generat de Utilizatori</h2>

            <h3>4.1 Responsabilitate</h3>
            <p>
              Ești responsabil pentru tot conținutul pe care îl publici (recenzii, 
              comentarii, postări, fotografii). Trebuie să ai drepturile necesare 
              pentru conținutul publicat.
            </p>

            <h3>4.2 Conținut Interzis</h3>
            <p>Este interzis să publici conținut care:</p>
            <ul>
              <li>Este ilegal, defăimător, obscen sau ofensator</li>
              <li>Încalcă drepturile de autor sau alte drepturi de proprietate intelectuală</li>
              <li>Conține date personale ale altor persoane fără consimțământ</li>
              <li>Este spam, publicitate nedeclarată sau conține malware</li>
              <li>Promovează discriminarea sau violența</li>
              <li>Este înșelător sau fraudulos</li>
            </ul>

            <h3>4.3 Licență pentru Conținut</h3>
            <p>
              Prin publicarea conținutului pe platformă, ne acorzi o licență neexclusivă, 
              gratuită, mondială de a folosi, afișa și distribui acest conținut în cadrul 
              serviciilor noastre.
            </p>

            <h3>4.4 Moderare</h3>
            <p>
              Ne rezervăm dreptul de a șterge sau modifica conținut care încalcă 
              acești termeni, fără notificare prealabilă.
            </p>

            <h2>5. Proprietate Intelectuală</h2>
            
            <h3>5.1 Conținutul Nostru</h3>
            <p>
              Site-ul, designul, logo-urile, textele și toate materialele create de noi 
              sunt protejate de drepturile de autor și alte legi de proprietate intelectuală.
            </p>

            <h3>5.2 Utilizare Permisă</h3>
            <p>
              Poți accesa și utiliza conținutul site-ului doar pentru uz personal, 
              necomercial. Este interzisă copierea, distribuirea sau modificarea 
              conținutului fără acordul nostru scris.
            </p>

            <h2>6. Recenzii și Rating-uri</h2>
            <p>
              Recenziile trebuie să reflecte experiențe reale și să fie corecte. 
              Este interzis să publici recenzii false, plătite sau care au scopul 
              de a manipula rating-urile.
            </p>

            <h2>7. Servicii ale Terților</h2>
            <p>
              Site-ul poate conține link-uri către site-uri terțe sau poate facilita 
              rezervări cu ghizi sau parteneri. Nu suntem responsabili pentru serviciile 
              sau conținutul terților.
            </p>

            <h2>8. Limitarea Răspunderii</h2>
            
            <h3>8.1 Disponibilitate</h3>
            <p>
              Site-ul este furnizat "așa cum este". Nu garantăm disponibilitatea 
              neîntreruptă sau lipsa erorilor.
            </p>

            <h3>8.2 Informații Turistice</h3>
            <p>
              Informațiile despre obiective turistice sunt furnizate cu titlu informativ. 
              Verifică întotdeauna informațiile actuale (program, prețuri, disponibilitate) 
              direct cu obiectivele sau autoritățile locale.
            </p>

            <h3>8.3 Daune</h3>
            <p>
              Nu suntem responsabili pentru daune indirecte, incidentale sau consecvente 
              rezultate din utilizarea site-ului.
            </p>

            <h2>9. Despăgubiri</h2>
            <p>
              Accepți să ne despăgubești și să ne exonerezi de orice pretenții, 
              daune sau cheltuieli rezultate din încălcarea de către tine a 
              acestor termeni sau a drepturilor altor persoane.
            </p>

            <h2>10. Modificări ale Termenilor</h2>
            <p>
              Putem modifica acești termeni oricând. Modificările intră în vigoare 
              la publicarea pe site. Continuarea utilizării site-ului după modificări 
              constituie acceptarea noilor termeni.
            </p>

            <h2>11. Legea Aplicabilă</h2>
            <p>
              Acești termeni sunt guvernați de legea română. Orice dispute vor fi 
              soluționate de instanțele competente din România.
            </p>

            <h2>12. Dispoziții Finale</h2>
            <p>
              Dacă orice prevedere din acești termeni este considerată invalidă, 
              restul prevederilor rămân în vigoare.
            </p>

            <h2>13. Contact</h2>
            <p>
              Pentru întrebări sau nelămuriri privind acești termeni, ne poți contacta:
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
