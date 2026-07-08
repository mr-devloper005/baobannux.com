'use client'

import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react'

type EditableRevealProps = {
  children: ReactNode
  /** Stagger index — each step adds a small transition delay. */
  index?: number
  /** Per-step delay in ms (multiplied by index). */
  step?: number
  /** Render element (section, div, li, article…). */
  as?: ElementType
  className?: string
}

/**
 * Scroll-reveal wrapper.
 *
 * - Renders children immediately (visible) for SSR / JS-off visitors.
 * - After mount it "arms" the hidden state (adds `is-armed`) and uses an
 *   IntersectionObserver to fade + slide each element up once it enters view.
 * - Stagger comes from an inline transitionDelay derived from `index`.
 *
 * The armed state is applied post-mount so no-JS visitors always see content.
 */
export function EditableReveal({
  children,
  index = 0,
  step = 80,
  as,
  className = '',
}: EditableRevealProps) {
  const Tag = (as || 'div') as ElementType
  const ref = useRef<HTMLElement | null>(null)
  const [armed, setArmed] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    // Respect reduced motion — never hide content.
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }
    setArmed(true)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const classes = ['editable-reveal', armed ? 'is-armed' : '', visible ? 'is-visible' : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag
      ref={ref as never}
      className={classes}
      style={armed ? { transitionDelay: `${Math.min(index, 12) * step}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}
