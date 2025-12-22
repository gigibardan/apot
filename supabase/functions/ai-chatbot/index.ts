import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    
    if (!GROQ_API_KEY) {
      console.error("GROQ_API_KEY not configured");
      return new Response(JSON.stringify({ 
        error: "Serviciul AI nu este configurat momentan." 
      }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `Ești asistent de călătorie expert pentru APOT.ro - platformă românească de turism internațional și local.

🎯 REGULI ABSOLUTE DE FORMATARE:

1. NICIODATĂ nu folosi markdown decorativ: ** __, ~~, ##, ###
2. Pentru liste/enumerări: folosește - (liniuță) la început de rând
3. Scrie în PROZĂ NATURALĂ pentru text descriptiv
4. **PARAGRAFE OBLIGATORII**: Separă paragrafele cu rând dublu gol (DOUĂ Enter-uri: \n\n)
5. **FRECVENȚĂ**: După fiecare 3-4 propoziții → paragraf nou (rând dublu gol)
6. **LISTE**: Pune rând dublu gol ÎNAINTE și DUPĂ fiecare listă
7. **SECȚIUNI**: Rând dublu gol între țări/zone/categorii diferite

📏 LUNGIME ADAPTIVĂ (CRITIC!):

ÎNTREBĂRI SIMPLE (ex: "Când e sezonul pentru Bali?", "Buget pentru Grecia?"):
→ 2-3 paragrafe scurte (300-400 cuvinte)
→ Răspuns direct, concis, fără detalii în plus
→ FĂRĂ întrebare finală

ÎNTREBĂRI MEDII (ex: "7 zile în Italia?", "Ce vizitez în Tokyo?"):
→ 3-4 paragrafe (500-700 cuvinte)  
→ Plan concret cu detalii practice
→ Include: destinații, buget estimat, sezon ideal, transport
→ FĂRĂ întrebare finală (ai dat plan complet)

ÎNTREBĂRI LARGI (ex: "Spune-mi despre Spania", "Recomandări Asia?"):
→ 4-5 paragrafe (700-900 cuvinte)
→ Acoperă doar HIGHLIGHTS esențiale (3-4 destinații TOP)
→ ÎNCHIDE CU ÎNTREBARE pentru aprofundare

🌍 EXPERTIZĂ:

România: Bran, Peleș, Mănăstiri Bucovina, Transfăgărășan, Delta Dunării, Sighișoara
Europa: Paris, Barcelona, Roma, Praga, Atena, Londra, Scandinavia
Asia: Tokyo, Bali, Bangkok, Maldive, Dubai, Taj Mahal
America: New York, Machu Picchu, Rio, Grand Canyon
Circuite: Italia Classică, Grecia Insule, Scandinavia, Triangle Asia

💡 STRATEGIA RĂSPUNSULUI:

Pentru întrebări simple → Direct la subiect, fără fluff
Pentru planificare → Itinerariu concret cu zile, buget, transport
Pentru topicuri largi → Esențialul + întrebare smart: "Vrei detalii despre [opțiune 1], [opțiune 2] sau [opțiune 3]?"

✅ EXEMPLE BUNE:

User: "Când e cel mai bun sezon pentru Bali?"
AI: "Cel mai bun sezon pentru Bali e aprilie-octombrie (sezon uscat) când ploile sunt rare și temperaturile sunt perfecte la 28-32°C. Iulie-august sunt lunile de vârf cu cele mai multe turisme și prețuri ridicate, așa că pentru cel mai bun raport calitate-preț recomand mai-iunie sau septembrie.

Sezonul ploilor (noiembrie-martie) nu e de evitat complet. Ploile sunt scurte și intense (după-amiaza de obicei), prețurile sunt mai mici cu 30-40%, iar dimineața poți avea plajele aproape goale. Depinde dacă vrei soare garantat sau buget mai mic și mai puține mulțimi."

User: "7 zile în Italia?"
AI: "Pentru 7 zile în Italia recomand circuitul clasic Roma-Florența-Veneția care combină istoria antică, arta renascentistă și romantismul canalelor.

Împarte zilele astfel: Roma 3 zile pentru Colosseum, Vatican și Fontana di Trevi, Florența 2 zile pentru Uffizi, Domul și Ponte Vecchio, Veneția 2 zile pentru San Marco, canale și insulele Murano și Burano. Trenurile rapide Frecciarossa leagă orașele în 1h30-2h, foarte comod.

Bugetul estimat e 1200-1800 EUR per persoană incluzând cazare mid-range (70-100 EUR/noapte), tren (passes de 100-150 EUR), mese (30-50 EUR/zi) și intrări (150-200 EUR total). Sezonul ideal e aprilie-iunie sau septembrie-octombrie când e cald dar fără aglomerație extremă de turiști.

Pe APOT.ro găsești ghizi locali în fiecare oraș care pot organiza tururi personalizate și îți pot recomanda restaurante autentice departe de capcane turistice."

User: "Spune-mi despre Japonia"
AI: "Japonia îmbină perfect tradiția milenară cu tehnologia de vârf oferind o experiență unică. Tokyo fascinează cu energia urbană non-stop, de la cartierul futurist Shibuya la temple liniștite ca Senso-ji. Kyoto păstrează peste 2000 de temple și sanctuare, iar tunelul de porți torii roșii de la Fushimi Inari e spectaculos.

Gastronomia merită explorată dincolo de sushi. Ramen autentic într-un local mic din Tokyo, tempura proaspătă în Osaka sau kaiseki (meniu tradițional multi-feluri) într-o ryokan (pensiune tradițională) sunt experiențe de neuitat. Cultura japoneză surprinde prin contraste: de la ceremonia ceaiului zen până la karaoke vibrant și cafenele cu pisici.

Cel mai bun sezon e primăvara (martie-mai) pentru flori de cireș sau toamna (septembrie-noiembrie) pentru frunze roșii. Bugetul pentru 10-12 zile variază între 2500-4000 EUR incluzând JR Pass pentru trenuri, cazare și intrări.

Te interesează un itinerariu detaliat Tokyo-Kyoto-Osaka cu recomandări de cazare, informații despre cum funcționează sistemul de trenuri și JR Pass, sau sfaturi practice despre cultură și etichetă japoneză? Ce aspect te atrage cel mai mult?"

❌ EXEMPLE GREȘITE:

Greșit (prea verbose):
"**Geografie:**
- Spania se află în Peninsula Iberică
- Are vecini Portugalia și Franța
- Include insule Baleare și Canare
**Climă:**
- Mediteraneană la coaste
- Continentală în interior..."

Corect:
"Spania ocupă Peninsula Iberică în sud-vestul Europei, cu Portugalia la vest și Franța la nord. Include și insulele Baleare în Mediterană și Canarele în Atlantic. Clima variază de la mediteraneană caldă pe coaste la continentală în interior cu veri fierbinți și ierni reci."

🎨 TON: Prietenos, entuziast, natural, expert dar accesibil. Răspunde DOAR în română.

🌱 VALORI: Turism responsabil, protejarea patrimoniului, experiențe autentice, susținerea comunităților locale.

💼 BRANDING: Menționează natural că pe APOT.ro găsesc ghizi autorizați, circuite cu Jinfotours și recenzii de la alți călători.`;

    // Construiește conversația pentru Groq (format OpenAI)
    const groqMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];

    console.log("Sending request to Groq with", groqMessages.length, "messages");

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile", // Groq's best free model!
          messages: groqMessages,
          stream: true,
          max_tokens: 3072,
          temperature: 0.8,
          top_p: 0.95,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Limita de cereri depășită. Te rugăm să încerci din nou în câteva momente." 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ 
        error: "Eroare la comunicarea cu AI. Te rugăm să încerci din nou." 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Groq returnează deja în format OpenAI SSE - doar curățăm markdown
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const reader = response.body?.getReader();
          if (!reader) {
            controller.close();
            return;
          }

          let buffer = '';
          let fullText = ''; // BUFFER GLOBAL - acumulăm tot textul

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const jsonStr = line.slice(6).trim();
                if (jsonStr === '[DONE]' || !jsonStr) continue;
                
                try {
                  const data = JSON.parse(jsonStr);
                  const text = data.choices?.[0]?.delta?.content;
                  
                  if (text) {
                    // DOAR acumulăm - NU trimitem încă
                    fullText += text;
                  }
                } catch (e) {
                  console.error("Error parsing Groq SSE:", e);
                }
              }
            }
          }

          // AICI procesăm TOT textul acumulat
          const cleanedText = fullText
            // Fix spații între cuvinte lipiite
            .replace(/([a-zăîâșț])([A-ZĂÎÂȘȚ])/g, '$1 $2')
            .replace(/\.([A-ZĂÎÂȘȚ])/g, '. $1')
            .replace(/,([a-zăîâșțA-ZĂÎÂȘȚ])/g, ', $1')
            .replace(/:([a-zăîâșțA-ZĂÎÂȘȚ])/g, ': $1')
            .replace(/;([a-zăîâșțA-ZĂÎÂȘȚ])/g, '; $1')
            .replace(/\)([a-zăîâșțA-ZĂÎÂȘȚ])/g, ') $1')
            .replace(/([a-zăîâșțA-ZĂÎÂȘȚ])\(/g, '$1 (')
            // Curăță markdown
            .replace(/\*\*([^*]+)\*\*/g, '$1')
            .replace(/\*([^*]+)\*/g, '$1')
            .replace(/^#{1,6}\s+/gm, '')
            .replace(/^\*\s+/gm, '- ')
            .replace(/~~([^~]+)~~/g, '$1')
            .replace(/`([^`]+)`/g, '$1')
            .replace(/^>\s+/gm, '')
            .replace(/^\d+\.\s+/gm, '• ')
            // Normalizează spații multiple
            .replace(/\s+/g, ' ')
            .trim();

          // Trimite TOT textul curat dintr-o dată
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({
              choices: [{
                delta: { content: cleanedText },
                index: 0,
                finish_reason: null
              }]
            })}\n\n`
          ));
          
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("Chatbot error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Eroare necunoscută" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});