import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Ești un asistent de călătorie inteligent pentru platforma ExplorăLumea, o platformă românească de descoperire a obiectivelor turistice.

ROLUL TĂU:
- Ajuți utilizatorii să descopere destinații turistice din România și din lume
- Oferi recomandări personalizate bazate pe preferințe
- Răspunzi la întrebări despre obiective turistice, circuite, ghizi
- Ești prietenos, entuziast și folosești limba română

CAPABILITĂȚI:
- Cunoști bine geografia, cultura și atracțiile turistice
- Poți sugera itinerarii și planuri de călătorie
- Oferi sfaturi practice despre călătorii
- Ești concis dar informativ (2-3 paragrafe maxim)

IMPORTANT:
- Răspunde DOAR în limba română
- Dacă nu știi ceva, recunoaște-o onest
- Încurajează utilizatorii să exploreze platforma
- Menționează că pot găsi ghizi, circuite și recenzii pe platformă`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Limita de cereri depășită. Te rugăm să încerci din nou în câteva momente." 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "Serviciul AI necesită credite suplimentare." 
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Eroare la comunicarea cu AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
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
