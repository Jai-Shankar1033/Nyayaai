"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { AppLanguage } from "@/hooks/use-language"

interface Field {
  key: string
  label: string
  required: boolean
  placeholder: string
}

interface DraftFormProps {
  draftType: string
  fields: Field[]
  lang: AppLanguage
  onSubmit: (values: Record<string, string>) => void
  loading: boolean
}

export function DraftForm({ draftType, fields, lang, onSubmit, loading }: DraftFormProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, boolean>>({})

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: Record<string, boolean> = {}
    fields.forEach(f => {
      if (f.required && !values[f.key]?.trim()) newErrors[f.key] = true
    })
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    setErrors({})
    onSubmit(values)
  }

  function set(key: string, value: string) {
    setValues(v => ({ ...v, [key]: value }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: false }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field, i) => (
        <motion.div
          key={field.key}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="space-y-1.5"
        >
          <label className="flex items-center gap-1 text-sm font-medium">
            {field.label}
            {field.required && <span className="text-destructive text-xs">*</span>}
          </label>
          {/* Use textarea for long fields */}
          {["incident_description", "complaint_details", "bail_grounds",
            "facts", "subject", "information_needed"].includes(field.key) ? (
            <textarea
              value={values[field.key] ?? ""}
              onChange={e => set(field.key, e.target.value)}
              placeholder={field.placeholder}
              rows={3}
              className={cn(
                "w-full px-3 py-2.5 rounded-xl border bg-background text-sm resize-none",
                "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
                "placeholder:text-muted-foreground transition-colors",
                errors[field.key] ? "border-destructive" : "border-input"
              )}
            />
          ) : (
            <input
              type="text"
              value={values[field.key] ?? ""}
              onChange={e => set(field.key, e.target.value)}
              placeholder={field.placeholder}
              className={cn(
                "w-full px-3 py-2.5 rounded-xl border bg-background text-sm",
                "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
                "placeholder:text-muted-foreground transition-colors",
                errors[field.key] ? "border-destructive" : "border-input"
              )}
            />
          )}
          {errors[field.key] && (
            <p className="text-xs text-destructive">This field is required</p>
          )}
        </motion.div>
      ))}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {lang === "hi" ? "तैयार हो रहा है…" : "Generating draft…"}
          </>
        ) : (
          lang === "hi" ? "मसौदा तैयार करें" : "Generate draft"
        )}
      </button>
    </form>
  )
}
