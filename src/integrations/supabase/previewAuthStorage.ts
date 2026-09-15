/**
 * Returns the auth storage adapter for the Supabase client.
 * Uses localStorage by default for session persistence.
 */
export function brokeredPreviewStorage() {
  if (typeof window === 'undefined') return undefined;
  return localStorage;
}
