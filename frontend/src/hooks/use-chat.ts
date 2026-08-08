"use client"
import { useState, useCallback, useRef } from "react"
import type { AppLanguage } from "./use-language"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  citations?: string[]
  isNew?: boolean
}

export function useChat(userId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [thinking, setThinking] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (content: string, lang: AppLanguage) => {
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content }
    setMessages(prev => [...prev, userMsg])
    setThinking(true)

    // Optimistic AI placeholder
    const aiId = crypto.randomUUID()
    setMessages(prev => [...prev, { id: aiId, role: "assistant", content: "", isNew: true }])

    abortRef.current = new AbortController()

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat/stream`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: abortRef.current.signal,
          body: JSON.stringify({
            session_id: sessionId,
            message: content,
            language: lang,
            history: messages.slice(-8).map(m => ({ role: m.role, content: m.content })),
            user_id: userId,
          }),
        }
      )

      if (!res.body) throw new Error("No stream body")
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ""
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const payload = line.slice(6).trim()
          if (payload === "[DONE]") continue
          try {
            const json = JSON.parse(payload)
            if (json.error) throw new Error(json.error)
            if (json.session_id) setSessionId(json.session_id)
            if (json.chunk) {
              accumulated += json.chunk
              setMessages(prev => prev.map(m =>
                m.id === aiId ? { ...m, content: accumulated } : m
              ))
            }
          } catch {}
        }
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return
      const errMsg = lang === "hi"
        ? "माफ़ करें, अभी जवाब देने में समस्या है। कृपया दोबारा कोशिश करें।"
        : "Sorry, I couldn't get a response right now. Please try again."
      setMessages(prev => prev.map(m =>
        m.id === aiId ? { ...m, content: errMsg } : m
      ))
    } finally {
      setThinking(false)
    }
  }, [messages, sessionId, userId])

  const clearMessages = useCallback(() => {
    setMessages([])
    setSessionId(null)
  }, [])

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort()
    setThinking(false)
  }, [])

  return { messages, thinking, sendMessage, clearMessages, stopGeneration }
}
