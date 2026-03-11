'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cn } from '@/lib/utils'

gsap.registerPlugin(ScrollTrigger)

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
  stagger?: boolean
}

export function AnimatedSection({ children, className, delay = 0, stagger = false }: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const targets = stagger ? Array.from(el.children) : [el]

    gsap.fromTo(
      targets,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        delay,
        stagger: stagger ? 0.08 : 0,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true,
        },
      }
    )

    return () => { ScrollTrigger.getAll().forEach(t => t.kill()) }
  }, [delay, stagger])

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  )
}

export function AnimatedPage({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    gsap.fromTo(el, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' })
  }, [])

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  )
}
