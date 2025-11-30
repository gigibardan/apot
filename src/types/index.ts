/**
 * Global TypeScript type definitions
 * Export all types from a single entry point
 */

// Common types used across the application
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type ValueOf<T> = T[keyof T];

// Utility types for API responses
export interface ApiResponse<T = unknown> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// TODO: Add database types (will be generated from Supabase)
// TODO: Add form types
// TODO: Add component prop types
