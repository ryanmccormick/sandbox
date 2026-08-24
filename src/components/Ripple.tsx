import { useState, type PointerEvent } from 'react'
import { cn } from '../lib/cn'

type RippleMark = { id: number; x: number; y: number; size: number }

export function useRipple(colorClass = 'bg-current/30') {
  const [ripples, setRipples] = useState<RippleMark[]>([])

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const id = event.timeStamp
    setRipples((current) => [
      ...current,
      {
        id,
        x: event.clientX - rect.left - size / 2,
        y: event.clientY - rect.top - size / 2,
        size,
      },
    ])
    window.setTimeout(() => {
      setRipples((current) => current.filter((ripple) => ripple.id !== id))
    }, 520)
  }

  const layer = (
    <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className={cn(
            'absolute rounded-full opacity-100 animate-[mui-ripple_520ms_linear]',
            colorClass,
          )}
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}
    </span>
  )

  return { onPointerDown, layer }
}
