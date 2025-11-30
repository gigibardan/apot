import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TranslateRequest {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
}

/**
 * Edge Function: Translate Content
 * Uses Google Translate API to translate content
 * 
 * Usage:
 * POST /translate-content
 * Body: {
 *   text: "Text to translate",
 *   targetLanguage: "en",
 *   sourceLanguage: "ro" (optional, auto-detect if not provided)
 * }
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { text, targetLanguage, sourceLanguage = "auto" }: TranslateRequest =
      await req.json();

    // Validate input
    if (!text || !targetLanguage) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: text, targetLanguage",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get Google Translate API key from environment
    const googleApiKey = Deno.env.get("GOOGLE_TRANSLATE_API_KEY");
    
    if (!googleApiKey) {
      console.error("GOOGLE_TRANSLATE_API_KEY not configured");
      return new Response(
        JSON.stringify({
          error: "Translation service not configured",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Call Google Translate API
    const translateUrl = new URL(
      "https://translation.googleapis.com/language/translate/v2"
    );
    translateUrl.searchParams.set("key", googleApiKey);
    translateUrl.searchParams.set("q", text);
    translateUrl.searchParams.set("target", targetLanguage);
    if (sourceLanguage !== "auto") {
      translateUrl.searchParams.set("source", sourceLanguage);
    }

    const translateResponse = await fetch(translateUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!translateResponse.ok) {
      const errorText = await translateResponse.text();
      console.error("Google Translate API error:", errorText);
      throw new Error(`Translation failed: ${translateResponse.statusText}`);
    }

    const translateData = await translateResponse.json();

    // Extract translated text
    const translatedText =
      translateData?.data?.translations?.[0]?.translatedText;
    const detectedSourceLanguage =
      translateData?.data?.translations?.[0]?.detectedSourceLanguage;

    if (!translatedText) {
      throw new Error("No translation returned from API");
    }

    // Return translated text
    return new Response(
      JSON.stringify({
        translatedText,
        detectedSourceLanguage,
        targetLanguage,
        originalText: text,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Translation error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Translation failed";

    return new Response(
      JSON.stringify({
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
