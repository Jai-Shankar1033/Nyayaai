"use client"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { AppLanguage } from "@/hooks/use-language"

interface LanguageToggleProps {
  lang: AppLanguage
  onToggle: () => void
  className?: string
}

export function LanguageToggle({ lang, onToggle, className }: LanguageToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative flex items-center gap-1 h-8 px-3 rounded-full border border-border bg-secondary text-xs font-medium transition-colors hover:border-primary/50",
        className
      )}
    >
      <span className={cn("transition-colors", lang === "en" ? "text-foreground" : "text-muted-foreground")}>EN</span>
      <span className="text-muted-foreground">/</span>
      <span className={cn("transition-colors", lang === "hi" ? "text-foreground" : "text-muted-foreground")}>हि</span>
      <motion.div
        layoutId="lang-indicator"
        className="absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-primary/20"
        animate={{ x: lang === "en" ? 4 : "calc(100% - 4px)" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{ left: 0 }}
      />
    </button>
  )
}
