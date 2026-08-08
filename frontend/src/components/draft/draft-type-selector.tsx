"use client"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const TYPES = [
  { type: "rti",                label: "RTI Application",       emoji: "📋", desc: "Right to Information request" },
  { type: "fir_complaint",      label: "FIR / Police Complaint",emoji: "🚔", desc: "Report crime to police" },
  { type: "bail_application",   label: "Bail Application",      emoji: "⚖️", desc: "Application for bail in court" },
  { type: "legal_notice",       label: "Legal Notice",          emoji: "📨", desc: "Formal notice to a party" },
  { type: "affidavit",          label: "Affidavit",             emoji: "📜", desc: "Sworn statement for court" },
  { type: "consumer_complaint", label: "Consumer Complaint",    emoji: "🛒", desc: "Complaint to consumer forum" },
  { type: "vakalatnama",        label: "Vakalatnama",           emoji: "🤝", desc: "Legal power of attorney" },
]

interface DraftTypeSelectorProps {
  selected: string | null
  onSelect: (type: string) => void
}

export function DraftTypeSelector({ selected, onSelect }: DraftTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {TYPES.map((t, i) => (
        <motion.button
          key={t.type}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          onClick={() => onSelect(t.type)}
          className={cn(
            "flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all",
            selected === t.type
              ? "border-primary bg-primary/10 text-foreground"
              : "border-border hover:border-primary/40 hover:bg-secondary/50 text-foreground"
          )}
        >
          <span className="text-xl shrink-0">{t.emoji}</span>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{t.label}</p>
            <p className="text-xs text-muted-foreground truncate">{t.desc}</p>
          </div>
          {selected === t.type && (
            <motion.div layoutId="selected-dot"
              className="w-2 h-2 rounded-full bg-primary ml-auto shrink-0" />
          )}
        </motion.button>
      ))}
    </div>
  )
}
