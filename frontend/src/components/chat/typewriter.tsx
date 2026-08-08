"use client"
import { useEffect, useState } from "react"

interface TypewriterProps {
  text: string
  speed?: number
  onDone?: () => void
}

export function Typewriter({ text, speed = 12, onDone }: TypewriterProps) {
  const [displayed, setDisplayed] = useState("")
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    setDisplayed("")
    setIdx(0)
  }, [text])

  useEffect(() => {
    if (idx >= text.length) { onDone?.(); return }
    const t = setTimeout(() => {
      setDisplayed(text.slice(0, idx + 1))
      setIdx(i => i + 1)
    }, speed)
    return () => clearTimeout(t)
  }, [idx, text, speed, onDone])

  return (
    <span>
      {displayed}
      {idx < text.length && (
        <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse-slow align-middle" />
      )}
    </span>
  )
}
