/**
 * Application route constants
 * Single source of truth for all routes
 */

export const PUBLIC_ROUTES = {
  home: "/",
  objectives: "/obiective",
  objectiveDetail: (slug: string) => `/obiective/${slug}`,
  blog: "/blog",
  blogPost: (slug: string) => `/blog/${slug}`,
  about: "/despre",
  contact: "/contact",
} as const;

export const ADMIN_ROUTES = {
  dashboard: "/admin",
  objectives: "/admin/obiective",
  objectivesCreate: "/admin/obiective/new",
  objectivesEdit: (id: string) => `/admin/obiective/${id}/edit`,
  blog: "/admin/blog",
  blogCreate: "/admin/blog/new",
  blogEdit: (id: string) => `/admin/blog/${id}/edit`,
  circuits: "/admin/circuite",
  circuitsCreate: "/admin/circuite/new",
  circuitsEdit: (id: string) => `/admin/circuite/${id}/edit`,
  media: "/admin/media",
  settings: "/admin/setari",
  users: "/admin/utilizatori",
  import: "/admin/import",
  templates: "/admin/templates",
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
