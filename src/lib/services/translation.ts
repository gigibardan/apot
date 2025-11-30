/**
 * Translation Service
 * Client-side helper for calling translation edge function
 */

import { supabase } from "@/integrations/supabase/client";

export interface TranslateOptions {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
}

export interface TranslateResponse {
  translatedText: string;
  detectedSourceLanguage?: string;
  targetLanguage: string;
  originalText: string;
}

/**
 * Translate text using Google Translate API via edge function
 */
export async function translateText({
  text,
  targetLanguage,
  sourceLanguage = "auto",
}: TranslateOptions): Promise<TranslateResponse> {
  try {
    const { data, error } = await supabase.functions.invoke("translate-content", {
      body: {
        text,
        targetLanguage,
        sourceLanguage,
      },
    });

    if (error) {
      console.error("Translation error:", error);
      throw new Error(error.message || "Translation failed");
    }

    return data;
  } catch (error) {
    console.error("Translation service error:", error);
    throw error;
  }
}

/**
 * Translate multiple texts in batch
 * Combines all texts with separators, translates, then splits
 */
export async function translateBatch({
  texts,
  targetLanguage,
  sourceLanguage = "auto",
}: {
  texts: string[];
  targetLanguage: string;
  sourceLanguage?: string;
}): Promise<string[]> {
  if (texts.length === 0) return [];

  // Use a unique separator that won't appear in content
  const separator = "\n<<<TRANSLATION_SEPARATOR>>>\n";
  const combinedText = texts.join(separator);

  const result = await translateText({
    text: combinedText,
    targetLanguage,
    sourceLanguage,
  });

  // Split translated text back into array
  return result.translatedText.split(separator);
}

/**
 * Translate object fields
 * Useful for translating multiple fields of an entity at once
 */
export async function translateObject<T extends Record<string, any>>({
  obj,
  fields,
  targetLanguage,
  sourceLanguage = "auto",
}: {
  obj: T;
  fields: (keyof T)[];
  targetLanguage: string;
  sourceLanguage?: string;
}): Promise<Partial<T>> {
  const textsToTranslate = fields
    .map((field) => obj[field])
    .filter((text) => typeof text === "string" && text.trim().length > 0);

  if (textsToTranslate.length === 0) {
    return {};
  }

  const translatedTexts = await translateBatch({
    texts: textsToTranslate,
    targetLanguage,
    sourceLanguage,
  });

  const result: Partial<T> = {};
  let translationIndex = 0;

  fields.forEach((field) => {
    const originalValue = obj[field];
    if (typeof originalValue === "string" && originalValue.trim().length > 0) {
      result[field] = translatedTexts[translationIndex] as any;
      translationIndex++;
    }
  });

  return result;
}
