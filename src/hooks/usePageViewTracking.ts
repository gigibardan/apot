/**
 * Page View Tracking Hook
 * Automatically tracks page views for analytics
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Generate or retrieve session ID from sessionStorage
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem("analytics_session_id");
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    sessionStorage.setItem("analytics_session_id", sessionId);
  }
  
  return sessionId;
};

// Get user agent
const getUserAgent = (): string => {
  return navigator.userAgent;
};

// Get referrer
const getReferrer = (): string => {
  return document.referrer || "direct";
};

export const usePageViewTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        const sessionId = getSessionId();
        const { data: { user } } = await supabase.auth.getUser();
        
        // Prepare page view data
        const pageViewData = {
          page_url: window.location.href,
          page_title: document.title,
          referrer: getReferrer(),
          user_agent: getUserAgent(),
          session_id: sessionId,
          user_id: user?.id || null,
        };

        // Insert page view
        const { error } = await supabase
          .from("page_views")
          .insert(pageViewData);

        if (error) {
          console.error("Error tracking page view:", error);
        }
      } catch (error) {
        console.error("Error in page view tracking:", error);
      }
    };

    // Track page view after a small delay to ensure page title is set
    const timeoutId = setTimeout(trackPageView, 100);

    return () => clearTimeout(timeoutId);
  }, [location.pathname, location.search]); // Track on route change
};
