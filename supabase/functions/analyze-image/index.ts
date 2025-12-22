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
    const { imageUrl, imageBase64, mimeType } = await req.json();
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

    if (!imageUrl && !imageBase64) {
      return new Response(JSON.stringify({ 
        error: "imageUrl sau imageBase64 este necesar" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `Analizează această imagine turistică din România și furnizează informații structurate.

Te rog să răspunzi DOAR cu un obiect JSON valid (fără markdown, fără backticks, doar JSON pur) cu următoarea structură:

{
  "detected": ["castel", "munte", "arhitectură medievală"],
  "suggested_types": ["castel", "monument"],
  "quality_score": 90,
  "description": "Un castel medieval impunător pe un deal, înconjurat de munți",
  "is_suitable": true,
  "recommendations": ["Foto de calitate excelentă", "Sugestie 2"]
}

REGULI:
- detected: 3-7 elemente detectate în imagine (în română)
- suggested_types: tipuri de obiectiv din lista: castel, cetate, muzeu, biserică, mănăstire, monument, parc natural, peșteră, plajă, stațiune, grădină, palat, fortăreață
- quality_score: 0-100 bazat pe calitatea fotografică (compoziție, luminozitate, claritate)
- description: Descriere scurtă și captivantă în română (max 100 caractere)
- is_suitable: true dacă imaginea e potrivită pentru o platformă turistică
- recommendations: 2-4 sugestii pentru îmbunătățire sau note despre imagine

IMPORTANT: Răspunde DOAR cu JSON-ul, fără text adițional, fără markdown, fără backticks!`;

    // Prepare image data
    let imagePart;
    if (imageBase64) {
      // Base64 image provided
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      imagePart = {
        inline_data: {
          mime_type: mimeType || 'image/jpeg',
          data: cleanBase64
        }
      };
    } else if (imageUrl) {
      // Fetch image from URL and convert to base64
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image from URL: ${imageResponse.status}`);
      }
      
      const imageBuffer = await imageResponse.arrayBuffer();
      const base64Image = btoa(
        new Uint8Array(imageBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );
      
      const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
      imagePart = {
        inline_data: {
          mime_type: contentType,
          data: base64Image
        }
      };
    }

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
            parts: [
              { text: prompt },
              imagePart
            ]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1024,
            topP: 0.95,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini Vision API error:", response.status, errorText);
      return new Response(JSON.stringify({ 
        error: "Eroare la analiza imaginii" 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error("No response from Gemini Vision");
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
      detected: Array.isArray(analysis.detected) ? analysis.detected : [],
      suggested_types: Array.isArray(analysis.suggested_types) ? analysis.suggested_types : [],
      quality_score: typeof analysis.quality_score === 'number' ? analysis.quality_score : 50,
      description: typeof analysis.description === 'string' ? analysis.description : '',
      is_suitable: typeof analysis.is_suitable === 'boolean' ? analysis.is_suitable : true,
      recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : [],
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Image analysis error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Eroare la analiza imaginii" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});