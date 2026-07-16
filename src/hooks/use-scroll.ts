import { useEffect, useRef } from 'react'

const BOTTOM_OFFSET = 120

export const useAutoScroll = <T>(dependency?: T) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const shouldAutoScrollRef = useRef(true)

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight

    shouldAutoScrollRef.current = distanceFromBottom < BOTTOM_OFFSET
  }

  useEffect(() => {
    if (!shouldAutoScrollRef.current) return

    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    })
  }, [dependency])

  return {
    scrollRef,
    bottomRef,
    handleScroll,
  }
}
