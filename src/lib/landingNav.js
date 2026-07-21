/** Anchor order matching HomePage section layout */
export const LANDING_SECTION_ORDER = [
  '#home',
  '#gallery',
  '#about',
  '#values',
  '#services',
  '#team',
  '#contact',
]

export const DEFAULT_LANDING_NAV = [
  { label: 'Home', href: '#home' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'About', href: '#about' },
  { label: 'Values', href: '#values' },
  { label: 'Programs', href: '#services' },
  { label: 'Team', href: '#team' },
  { label: 'Contact', href: '#contact' },
]

export function sortNavByLandingOrder(links = []) {
  return [...links].sort((a, b) => {
    const ai = LANDING_SECTION_ORDER.indexOf(a.href)
    const bi = LANDING_SECTION_ORDER.indexOf(b.href)
    if (ai === -1 && bi === -1) return 0
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })
}
