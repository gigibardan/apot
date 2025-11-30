/**
 * Custom Hook for Translated Content
 * Automatically fetches and merges database translations with original content
 */

import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  getObjectiveTranslation,
  getGuideTranslation,
  getBlogArticleTranslation,
} from "@/lib/supabase/queries/translations";
import { DEFAULT_LANGUAGE } from "@/lib/i18n/config";

/**
 * Hook for translated objective content
 */
export function useTranslatedObjective<T extends { id: string }>(
  objective: T | null | undefined
) {
  const { currentLanguage } = useLanguage();
  const [translatedContent, setTranslatedContent] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!objective) {
      setTranslatedContent(null);
      return;
    }

    // If current language is default, no need to fetch translation
    if (currentLanguage === DEFAULT_LANGUAGE) {
      setTranslatedContent(objective);
      return;
    }

    setIsLoading(true);

    getObjectiveTranslation(objective.id, currentLanguage)
      .then((translation) => {
        if (translation) {
          // Merge translation with original objective
          setTranslatedContent({
            ...objective,
            ...translation,
          } as T);
        } else {
          // Fallback to original content
          setTranslatedContent(objective);
        }
      })
      .catch((error) => {
        console.error("Error loading objective translation:", error);
        setTranslatedContent(objective);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [objective, currentLanguage]);

  return { content: translatedContent, isLoading };
}

/**
 * Hook for translated guide content
 */
export function useTranslatedGuide<T extends { id: string }>(
  guide: T | null | undefined
) {
  const { currentLanguage } = useLanguage();
  const [translatedContent, setTranslatedContent] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!guide) {
      setTranslatedContent(null);
      return;
    }

    if (currentLanguage === DEFAULT_LANGUAGE) {
      setTranslatedContent(guide);
      return;
    }

    setIsLoading(true);

    getGuideTranslation(guide.id, currentLanguage)
      .then((translation) => {
        if (translation) {
          setTranslatedContent({
            ...guide,
            ...translation,
          } as T);
        } else {
          setTranslatedContent(guide);
        }
      })
      .catch((error) => {
        console.error("Error loading guide translation:", error);
        setTranslatedContent(guide);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [guide, currentLanguage]);

  return { content: translatedContent, isLoading };
}

/**
 * Hook for translated blog article content
 */
export function useTranslatedBlogArticle<T extends { id: string }>(
  article: T | null | undefined
) {
  const { currentLanguage } = useLanguage();
  const [translatedContent, setTranslatedContent] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!article) {
      setTranslatedContent(null);
      return;
    }

    if (currentLanguage === DEFAULT_LANGUAGE) {
      setTranslatedContent(article);
      return;
    }

    setIsLoading(true);

    getBlogArticleTranslation(article.id, currentLanguage)
      .then((translation) => {
        if (translation) {
          setTranslatedContent({
            ...article,
            ...translation,
          } as T);
        } else {
          setTranslatedContent(article);
        }
      })
      .catch((error) => {
        console.error("Error loading article translation:", error);
        setTranslatedContent(article);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [article, currentLanguage]);

  return { content: translatedContent, isLoading };
}

/**
 * Hook for translating multiple objectives at once
 */
export function useTranslatedObjectives<T extends { id: string }>(
  objectives: T[] | null | undefined
) {
  const { currentLanguage } = useLanguage();
  const [translatedContent, setTranslatedContent] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!objectives || objectives.length === 0) {
      setTranslatedContent([]);
      return;
    }

    if (currentLanguage === DEFAULT_LANGUAGE) {
      setTranslatedContent(objectives);
      return;
    }

    setIsLoading(true);

    Promise.all(
      objectives.map(async (objective) => {
        try {
          const translation = await getObjectiveTranslation(
            objective.id,
            currentLanguage
          );
          if (translation) {
            return { ...objective, ...translation } as T;
          }
          return objective;
        } catch (error) {
          console.error(
            `Error loading translation for objective ${objective.id}:`,
            error
          );
          return objective;
        }
      })
    )
      .then(setTranslatedContent)
      .finally(() => setIsLoading(false));
  }, [objectives, currentLanguage]);

  return { content: translatedContent, isLoading };
}
