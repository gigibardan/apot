import { useState, useEffect, useCallback } from 'react';

export interface CookiePreferences {
  necessary: boolean; // Always true, cannot be disabled
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

const COOKIE_CONSENT_KEY = 'cookie_consent';
const COOKIE_PREFERENCES_KEY = 'cookie_preferences';

const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  functional: false,
};

export function useCookieConsent() {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);

    if (consent === null) {
      setHasConsent(null);
      setShowBanner(true);
    } else {
      setHasConsent(consent === 'true');
      setShowBanner(false);
      if (savedPreferences) {
        try {
          setPreferences(JSON.parse(savedPreferences));
        } catch {
          setPreferences(defaultPreferences);
        }
      }
    }
  }, []);

  const acceptAll = useCallback(() => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(allAccepted));
    setHasConsent(true);
    setPreferences(allAccepted);
    setShowBanner(false);
  }, []);

  const acceptNecessary = useCallback(() => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(onlyNecessary));
    setHasConsent(true);
    setPreferences(onlyNecessary);
    setShowBanner(false);
  }, []);

  const savePreferences = useCallback((newPreferences: CookiePreferences) => {
    const finalPreferences = { ...newPreferences, necessary: true };
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(finalPreferences));
    setHasConsent(true);
    setPreferences(finalPreferences);
    setShowBanner(false);
  }, []);

  const resetConsent = useCallback(() => {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    localStorage.removeItem(COOKIE_PREFERENCES_KEY);
    setHasConsent(null);
    setPreferences(defaultPreferences);
    setShowBanner(true);
  }, []);

  const openSettings = useCallback(() => {
    setShowBanner(true);
  }, []);

  return {
    hasConsent,
    preferences,
    showBanner,
    acceptAll,
    acceptNecessary,
    savePreferences,
    resetConsent,
    openSettings,
    setShowBanner,
  };
}
