/**
 * Normalize Django media URLs for the frontend.
 * API responses often use http://127.0.0.1:8000/media/... — use /media/... so Vite proxies same-origin.
 */
export function mediaUrl(url: string | null | undefined): string {
  if (!url) return ''

  const trimmed = String(url).trim()
  if (!trimmed) return ''

  try {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const parsed = new URL(trimmed)
      if (parsed.pathname.startsWith('/media/')) {
        return `${parsed.pathname}${parsed.search}`
      }
    }
  } catch {
    /* fall through */
  }

  if (trimmed.startsWith('/media/')) return trimmed

  return trimmed
}
