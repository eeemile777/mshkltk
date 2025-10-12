/** Canonical base (prefer prod domain). Fallback: current frame only. */
export const APP_BASE =
  (import.meta as any)?.env?.VITE_PUBLIC_BASE_URL?.replace(/\/$/, '') ||
  `${window.location.origin}${window.location.pathname.replace(/\/$/, '')}`;

/**
 * Build an absolute URL for a HashRouter route safely (no parent/top).
 * @param pathTemplate The route path from constants.ts, e.g., '/report/:id'.
 * @param id The ID to insert into the path.
 * @returns A full, shareable URL, e.g., 'https://app.com/#/report/123'.
 */
export function buildReportUrl(pathTemplate: string, id: string): string {
  let hashPath = pathTemplate.replace(':id', encodeURIComponent(id));
  
  // Ensure hashPath starts with exactly one '/' and no '#'.
  if (hashPath.startsWith('#')) {
    hashPath = hashPath.substring(1);
  }
  if (hashPath.startsWith('/')) {
    hashPath = hashPath.substring(1);
  }

  return `${APP_BASE}#/${hashPath}`;
}
