export function getApiUrl(path: string): string {
  const envBase = process.env.NEXT_PUBLIC_APP_URL
  if (typeof window !== 'undefined') {
    // Use current origin in browser for same-origin API calls
    return new URL(path, window.location.origin).toString()
  }
  // On server, prefer configured base URL; fall back to relative path
  return envBase ? new URL(path, envBase).toString() : path
}

export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return process.env.NEXT_PUBLIC_APP_URL || ''
}