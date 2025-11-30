/**
 * Analytics Events Infrastructure
 * 
 * Phase 1: Console logging for development
 * Phase 2: Integration with analytics service (Google Analytics, Plausible, etc.)
 * 
 * All user interactions should be tracked for insights:
 * - Which continents are most popular
 * - Which objectives get the most views
 * - Circuit click-through rates
 * - Newsletter conversion rates
 * - User journey through the site
 */

interface BaseEvent {
  timestamp: Date;
  url: string;
  referrer: string;
}

interface ContinentClickEvent extends BaseEvent {
  eventType: "continent_click";
  continentSlug: string;
  continentName: string;
}

interface ObjectiveViewEvent extends BaseEvent {
  eventType: "objective_view";
  objectiveId: string;
  objectiveTitle: string;
  objectiveSlug: string;
}

interface CircuitClickEvent extends BaseEvent {
  eventType: "circuit_click";
  circuitId: string;
  circuitName: string;
  destination: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
}

interface NewsletterSignupEvent extends BaseEvent {
  eventType: "newsletter_signup";
  email: string;
}

interface SectionViewEvent extends BaseEvent {
  eventType: "section_view";
  sectionName: string;
}

type AnalyticsEvent =
  | ContinentClickEvent
  | ObjectiveViewEvent
  | CircuitClickEvent
  | NewsletterSignupEvent
  | SectionViewEvent;

/**
 * Base event tracking function
 * Currently logs to console, will send to analytics service in Phase 2
 */
function trackEvent(event: AnalyticsEvent) {
  // Phase 1: Console logging
  console.log("📊 Analytics Event:", event);

  // Phase 2: Send to analytics service
  // Example for Google Analytics:
  // if (window.gtag) {
  //   window.gtag('event', event.eventType, { ...event });
  // }

  // Example for Plausible:
  // if (window.plausible) {
  //   window.plausible(event.eventType, { props: event });
  // }
}

/**
 * Track continent card click
 */
export function trackContinentClick(continentSlug: string, continentName: string) {
  trackEvent({
    eventType: "continent_click",
    continentSlug,
    continentName,
    timestamp: new Date(),
    url: window.location.href,
    referrer: document.referrer,
  });
}

/**
 * Track objective view
 */
export function trackObjectiveView(
  objectiveId: string,
  objectiveTitle: string,
  objectiveSlug: string
) {
  trackEvent({
    eventType: "objective_view",
    objectiveId,
    objectiveTitle,
    objectiveSlug,
    timestamp: new Date(),
    url: window.location.href,
    referrer: document.referrer,
  });
}

/**
 * Track Jinfotours circuit click
 * Important for affiliate tracking and revenue attribution
 */
export function trackCircuitClick(
  circuitId: string,
  circuitName: string,
  destination: string,
  source: "homepage" | "listing" | "objective_page" = "homepage"
) {
  trackEvent({
    eventType: "circuit_click",
    circuitId,
    circuitName,
    destination,
    utmSource: "apot",
    utmMedium: source,
    utmCampaign: "featured",
    timestamp: new Date(),
    url: window.location.href,
    referrer: document.referrer,
  });
}

/**
 * Track newsletter signup
 */
export function trackNewsletterSignup(email: string) {
  trackEvent({
    eventType: "newsletter_signup",
    email,
    timestamp: new Date(),
    url: window.location.href,
    referrer: document.referrer,
  });
}

/**
 * Track section view (when section enters viewport)
 */
export function trackSectionView(sectionName: string) {
  trackEvent({
    eventType: "section_view",
    sectionName,
    timestamp: new Date(),
    url: window.location.href,
    referrer: document.referrer,
  });
}

/**
 * Track objectives listing page view
 */
export function trackObjectivesPageView(filters: {
  continent?: string;
  country?: string;
  types?: string[];
  unesco?: boolean;
  featured?: boolean;
  search?: string;
  resultsCount: number;
}) {
  console.log("📊 Objectives Page View:", {
    ...filters,
    timestamp: new Date(),
    url: window.location.href,
  });
}

/**
 * Track filter application
 */
export function trackFilterApply(filterType: string, filterValue: any) {
  console.log("📊 Filter Applied:", {
    filterType,
    filterValue,
    timestamp: new Date(),
    url: window.location.href,
  });
}

/**
 * Track pagination navigation
 */
export function trackPaginationClick(fromPage: number, toPage: number) {
  console.log("📊 Pagination Click:", {
    fromPage,
    toPage,
    direction: toPage > fromPage ? "next" : "previous",
    timestamp: new Date(),
    url: window.location.href,
  });
}

/**
 * Track search query
 */
export function trackSearchQuery(query: string, resultsCount: number) {
  console.log("📊 Search Query:", {
    query,
    resultsCount,
    timestamp: new Date(),
    url: window.location.href,
  });
}
