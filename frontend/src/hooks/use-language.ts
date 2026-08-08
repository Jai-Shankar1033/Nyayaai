"use client"
import { useState, useCallback } from "react"

export type AppLanguage = "en" | "hi"

const LABELS: Record<AppLanguage, { toggle: string; placeholder: string; thinking: string }> = {
  en: { toggle: "हिंदी", placeholder: "Ask a legal question…", thinking: "Thinking…" },
  hi: { toggle: "English", placeholder: "कोई कानूनी सवाल पूछें…", thinking: "सोच रहा हूं…" },
}

export function useLanguage(initial: AppLanguage = "en") {
  const [lang, setLang] = useState<AppLanguage>(initial)
  const toggle = useCallback(() => setLang(l => l === "en" ? "hi" : "en"), [])
  return { lang, toggle, labels: LABELS[lang] }
}
