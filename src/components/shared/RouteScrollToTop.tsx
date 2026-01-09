import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Component that automatically scrolls to top when route changes.
 * Should be placed inside BrowserRouter.
 */
export const RouteScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top on pathname change
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
};
