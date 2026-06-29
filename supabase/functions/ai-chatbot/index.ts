import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limit: 20 requests per hour per user
const RATE_LIMIT_REQUESTS = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!GROQ_API_KEY) {
      console.error("GROQ_API_KEY not configured");
      return new Response(JSON.stringify({ 
        error: "Serviciul AI nu este configurat momentan." 
      }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase client with service role for rate limiting
    const supabaseAdmin = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    );

    // Extract user from authorization header
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      
      // Try to get user from token (if it's a user JWT, not just the anon key)
      const supabaseClient = createClient(SUPABASE_URL!, token);
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
      
      if (!userError && user) {
        userId = user.id;
      }
    }

    // If no authenticated user, check IP-based rate limit instead
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    // Rate limiting check
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    
    let rateLimitQuery;
    if (userId) {
      // User-based rate limiting
      rateLimitQuery = await supabaseAdmin
        .from('ai_chatbot_usage')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', windowStart);
    } else {
      // IP-based rate limiting for anonymous users (stricter: 10 requests/hour)
      rateLimitQuery = await supabaseAdmin
        .from('ai_chatbot_usage')
        .select('id', { count: 'exact', head: true })
        .eq('ip_address', clientIP)
        .is('user_id', null)
        .gte('created_at', windowStart);
    }

    const requestCount = rateLimitQuery.count || 0;
    const maxRequests = userId ? RATE_LIMIT_REQUESTS : 10; // Anonymous users get fewer requests

    if (requestCount >= maxRequests) {
      console.log(`Rate limit exceeded for ${userId ? 'user ' + userId : 'IP ' + clientIP}: ${requestCount}/${maxRequests}`);
      return new Response(JSON.stringify({ 
        error: "Ai depășit limita de cereri. Te rugăm să încerci din nou mai târziu sau să te autentifici pentru mai multe cereri." 
      }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log usage for rate limiting
    await supabaseAdmin.from('ai_chatbot_usage').insert({
      user_id: userId,
      ip_address: clientIP,
    });

    console.log(`AI request from ${userId ? 'user ' + userId : 'IP ' + clientIP}: ${requestCount + 1}/${maxRequests}`);

    const systemPrompt = `Ești asistent de călătorie expert pentru apot.club - platformă românească de turism internațional și local.

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

🎨 TON: Prietenos, entuziast, natural, expert dar accesibil. Răspunde DOAR în română.

🌱 VALORI: Turism responsabil, protejarea patrimoniului, experiențe autentice, susținerea comunităților locale.

💼 BRANDING: Menționează natural că pe apot.club găsesc ghizi autorizați, circuite cu Jinfotours și recenzii de la alți călători.`;

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
          model: "llama-3.3-70b-versatile",
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
          let fullText = '';

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
                    fullText += text;
                  }
                } catch (e) {
                  console.error("Error parsing Groq SSE:", e);
                }
              }
            }
          }

          // Process all accumulated text
          const cleanedText = fullText
            .replace(/([a-zăîâșț])([A-ZĂÎÂȘȚ])/g, '$1 $2')
            .replace(/\.([A-ZĂÎÂȘȚ])/g, '. $1')
            .replace(/,([a-zăîâșțA-ZĂÎÂȘȚ])/g, ', $1')
            .replace(/:([a-zăîâșțA-ZĂÎÂȘȚ])/g, ': $1')
            .replace(/;([a-zăîâșțA-ZĂÎÂȘȚ])/g, '; $1')
            .replace(/\)([a-zăîâșțA-ZĂÎÂȘȚ])/g, ') $1')
            .replace(/([a-zăîâșțA-ZĂÎÂȘȚ])\(/g, '$1 (')
            .replace(/\*\*([^*]+)\*\*/g, '$1')
            .replace(/\*([^*]+)\*/g, '$1')
            .replace(/^#{1,6}\s+/gm, '')
            .replace(/^\*\s+/gm, '- ')
            .replace(/~~([^~]+)~~/g, '$1')
            .replace(/`([^`]+)`/g, '$1')
            .replace(/^>\s+/gm, '')
            .replace(/^\d+\.\s+/gm, '• ')
            .replace(/\s+/g, ' ')
            .trim();

          // Send all cleaned text at once
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
