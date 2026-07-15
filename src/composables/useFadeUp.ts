import { onMounted, onUnmounted } from 'vue'

/**
 * useFadeUp — registers an IntersectionObserver on all [data-fade] elements.
 * Elements animate in with a staggered delay when they enter the viewport.
 *
 * @param selector  CSS selector for elements to observe (default: '[data-fade]')
 */
export function useFadeUp(selector = '[data-fade]'): void {
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer!.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 },
    )

    const els = document.querySelectorAll<HTMLElement>(selector)
    els.forEach((el, i) => {
      el.style.transitionDelay = `${i * 80}ms`
      observer!.observe(el)
    })
  })

  onUnmounted(() => {
    observer?.disconnect()
    observer = null
  })
}
