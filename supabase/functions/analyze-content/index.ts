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
    const { title, description, content, type } = await req.json();
    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    
    if (!GOOGLE_AI_API_KEY) {
      console.error("GOOGLE_AI_API_KEY not configured");
      return new Response(JSON.stringify({ 
        error: "Serviciul AI nu este configurat momentan." 
      }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `Analizează următorul conținut turistic românesc și generează sugestii pentru optimizare SEO și categorii.

TIP CONȚINUT: ${type || 'obiectiv turistic'}
TITLU: ${title || 'N/A'}
DESCRIERE: ${description || 'N/A'}
CONȚINUT: ${content || 'N/A'}

Te rog să răspunzi DOAR cu un obiect JSON valid (fără markdown, fără backticks, doar JSON pur) cu următoarea structură:

{
  "tags": ["tag1", "tag2", "tag3"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "suggested_types": ["castel", "cetate", "muzeu"],
  "quality_score": 85,
  "improvements": ["Sugestie 1", "Sugestie 2"],
  "meta_description": "O meta descriere SEO optimizată de maxim 155 caractere",
  "seo_title": "Un titlu SEO optimizat de maxim 60 caractere"
}

REGULI IMPORTANTE:
- tags: 5-10 taguri relevante în română (ex: "turism cultural", "patrimoniu UNESCO", "Transilvania")
- keywords: 5-10 cuvinte cheie pentru SEO în română
- suggested_types: tipuri de obiectiv din lista: castel, cetate, muzeu, biserică, mănăstire, monument, parc natural, peșteră, plajă, stațiune, grădină, palat, fortăreață
- quality_score: 0-100 bazat pe completitudinea informațiilor
- improvements: 3-5 sugestii concrete de îmbunătățire
- meta_description: Descriere captivantă, max 155 caractere
- seo_title: Titlu optimizat, max 60 caractere, include keyword principal

IMPORTANT: Răspunde DOAR cu JSON-ul, fără text adițional, fără markdown, fără backticks!`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_AI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
            topP: 0.95,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      return new Response(JSON.stringify({ 
        error: "Eroare la analiza conținutului" 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error("No response from Gemini");
    }

    // Clean response - remove markdown code blocks if present
    let cleanedText = generatedText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\s*/, '').replace(/```\s*$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\s*/, '').replace(/```\s*$/, '');
    }

    // Parse JSON
    let analysis;
    try {
      analysis = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Text:", cleanedText);
      
      // Fallback: extract JSON from text
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse AI response as JSON");
      }
    }

    // Validate and provide defaults
    const result = {
      tags: Array.isArray(analysis.tags) ? analysis.tags : [],
      keywords: Array.isArray(analysis.keywords) ? analysis.keywords : [],
      suggested_types: Array.isArray(analysis.suggested_types) ? analysis.suggested_types : [],
      quality_score: typeof analysis.quality_score === 'number' ? analysis.quality_score : 50,
      improvements: Array.isArray(analysis.improvements) ? analysis.improvements : [],
      meta_description: typeof analysis.meta_description === 'string' ? analysis.meta_description : '',
      seo_title: typeof analysis.seo_title === 'string' ? analysis.seo_title : title,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Content analysis error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Eroare la analiza conținutului" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});