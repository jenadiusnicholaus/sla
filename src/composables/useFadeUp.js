import { onMounted, onUnmounted } from 'vue'

/**
 * useFadeUp — attach to any container with [data-fade] children.
 * Children stagger in with 80ms delay per item.
 */
export function useFadeUp(selector = '[data-fade]') {
  let observer = null

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 }
    )

    document.querySelectorAll(selector).forEach((el, i) => {
      el.style.transitionDelay = `${i * 80}ms`
      observer.observe(el)
    })
  })

  onUnmounted(() => observer?.disconnect())
}
