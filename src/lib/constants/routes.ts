/**
 * Application route constants
 * Single source of truth for all routes
 */

export const PUBLIC_ROUTES = {
  home: "/",
  objectives: "/obiective",
  objectiveDetail: (slug: string) => `/obiective/${slug}`,
  guides: "/ghizi",
  guideDetail: (slug: string) => `/ghid/${slug}`,
  authorizedGuidesList: "/ghizi-autorizati",
  blog: "/blog",
  blogPost: (slug: string) => `/blog/${slug}`,
  about: "/despre",
  contact: "/contact",
} as const;

export const ADMIN_ROUTES = {
  dashboard: "/admin",
  analytics: "/admin/analytics",
  objectives: "/admin/obiective",
  objectivesCreate: "/admin/obiective/nou",
  objectivesEdit: (id: string) => `/admin/obiective/${id}`,
  blog: "/admin/blog",
  blogCreate: "/admin/blog/nou",
  blogEdit: (id: string) => `/admin/blog/${id}`,
  circuits: "/admin/circuite",
  circuitsCreate: "/admin/circuite/nou",
  circuitsEdit: (id: string) => `/admin/circuite/${id}`,
  guides: "/admin/ghizi",
  guidesCreate: "/admin/ghizi/nou",
  guidesEdit: (id: string) => `/admin/ghizi/${id}/edit`,
  authorizedGuides: "/admin/ghizi-autorizati",
  guideReviews: "/admin/recenzii-ghizi",
  objectiveReviews: "/admin/recenzii-obiective",
  media: "/admin/media",
  settings: "/admin/setari",
  users: "/admin/utilizatori",
  import: "/admin/import",
  templates: "/admin/templates",
  newsletter: "/admin/newsletter",
  contactMessages: "/admin/mesaje-contact",
  forum: "/admin/forum",
} as const;

export const AUTH_ROUTES = {
  login: "/auth/login",
  signup: "/auth/signup",
  resetPassword: "/auth/reset-password",
  callback: "/auth/callback",
} as const;

export type PublicRoute = typeof PUBLIC_ROUTES[keyof typeof PUBLIC_ROUTES];
export type AdminRoute = typeof ADMIN_ROUTES[keyof typeof ADMIN_ROUTES];
export type AuthRoute = typeof AUTH_ROUTES[keyof typeof AUTH_ROUTES];
