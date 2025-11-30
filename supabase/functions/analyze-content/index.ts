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
    const { title, description, content } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const analysisPrompt = `Analizează următorul conținut turistic și returnează un JSON cu următoarele:

TITLU: ${title}
DESCRIERE: ${description}
CONȚINUT: ${content || 'N/A'}

Returnează STRICT un JSON în următorul format (fără text suplimentar):
{
  "tags": ["tag1", "tag2", ...] (5-10 taguri relevante în română),
  "keywords": ["keyword1", "keyword2", ...] (10-15 cuvinte cheie SEO),
  "suggested_types": ["tip1", "tip2"] (tipuri turistice: muzeu, monument, naturā, adventure, etc.),
  "quality_score": 85 (0-100, evaluare completitudine și calitate),
  "improvements": ["sugestie1", "sugestie2"] (3-5 sugestii de îmbunătățire),
  "meta_description": "descriere SEO optimizată 150-160 caractere"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "Ești un expert SEO și analiză de conținut turistic. Returnezi DOAR JSON valid, fără explicații."
          },
          {
            role: "user",
            content: analysisPrompt
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI analysis error:", response.status, errorText);
      throw new Error("Failed to analyze content");
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "{}";
    
    // Extract JSON from response (in case AI adds extra text)
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    const analysisResult = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(aiResponse);

    console.log("Content analysis result:", analysisResult);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Content analysis error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Eroare la analiză" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
