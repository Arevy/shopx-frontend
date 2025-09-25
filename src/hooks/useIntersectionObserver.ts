import { RefObject, useEffect, useState } from 'react'

interface Options extends IntersectionObserverInit {
  freezeOnceVisible?: boolean
}

export function useIntersectionObserver(
  elementRef: RefObject<Element>,
  { threshold = 0.3, root = null, rootMargin = '0px', freezeOnceVisible = true }: Options = {},
) {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)

  useEffect(() => {
    const node = elementRef.current
    if (!node) return

    const hasIntersected = entry?.isIntersecting && freezeOnceVisible
    if (hasIntersected) return

    const observer = new IntersectionObserver((entries) => {
      setEntry(entries[0])
    }, { threshold, root, rootMargin })

    observer.observe(node)
    return () => {
      observer.disconnect()
    }
  }, [elementRef, threshold, root, rootMargin, freezeOnceVisible, entry?.isIntersecting])

  return entry
}
