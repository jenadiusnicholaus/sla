/**
 * Normalize Django media URLs for the frontend.
 * Always point absolute /media/ paths at the API host over HTTPS
 * (avoids mixed-content http://api… and broken localhost URLs).
 */

const API_ORIGIN = String(
  import.meta.env.VITE_API_URL || 'https://api.streetlabsafrica.org/api',
)
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '')

export function mediaUrl(url: string | null | undefined): string {
  if (!url) return ''

  const trimmed = String(url).trim()
  if (!trimmed) return ''

  try {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const parsed = new URL(trimmed)
      if (parsed.pathname.startsWith('/media/')) {
        return `${API_ORIGIN}${parsed.pathname}${parsed.search}`
      }
      if (
        parsed.protocol === 'http:' &&
        (parsed.hostname === 'api.streetlabsafrica.org' ||
          parsed.hostname.endsWith('.streetlabsafrica.org'))
      ) {
        parsed.protocol = 'https:'
        return parsed.toString()
      }
    }
  } catch {
    /* fall through */
  }

  if (trimmed.startsWith('/media/')) {
    return `${API_ORIGIN}${trimmed}`
  }

  return trimmed
}
