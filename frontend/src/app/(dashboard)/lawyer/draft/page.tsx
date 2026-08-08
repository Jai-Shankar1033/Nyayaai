"use client"
import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { DraftTypeSelector } from "@/components/draft/draft-type-selector"
import { DraftForm } from "@/components/draft/draft-form"
import { DraftOutput } from "@/components/draft/draft-output"
import { useUser } from "@/hooks/use-user"
import { ChevronLeft } from "lucide-react"

interface Field { key: string; label: string; required: boolean; placeholder: string }

export default function LawyerDraftPage() {
  const { profile } = useUser()
  const [step, setStep] = useState<"select" | "form" | "output">("select")
  const [draftType, setDraftType] = useState<string | null>(null)
  const [fields, setFields] = useState<Field[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ content: string; word_count: number } | null>(null)

  async function handleTypeSelect(type: string) {
    setDraftType(type)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/drafting/fields/${type}`)
      const data = await res.json()
      setFields(data.fields)
    } catch { setFields([]) }
    setStep("form")
  }

  async function handleFormSubmit(values: Record<string, string>) {
    if (!draftType) return
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/drafting/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draft_type: draftType,
          context: values,
          language: "en",
          user_id: profile?.id ?? "anonymous",
        }),
      })
      const data = await res.json()
      setResult({ content: data.content, word_count: data.word_count })
      setStep("output")
    } catch { alert("Generation failed. Is the backend running?") }
    setLoading(false)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        {step !== "select" && (
          <button onClick={() => { setStep("select"); setResult(null) }}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        <div>
          <h1 className="text-xl font-semibold">AI Draft Generator</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {step === "select" && "Choose a document type to get started"}
            {step === "form" && "Fill in the details — AI will draft the document"}
            {step === "output" && "Your draft is ready — review before submitting"}
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {["select", "form", "output"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-medium transition-colors ${
              step === s ? "bg-primary text-primary-foreground" :
              ["select","form","output"].indexOf(step) > i ? "bg-primary/30 text-primary" : "bg-secondary text-muted-foreground"
            }`}>{i + 1}</div>
            {i < 2 && <div className={`h-px w-8 transition-colors ${
              ["select","form","output"].indexOf(step) > i ? "bg-primary/40" : "bg-border"
            }`} />}
          </div>
        ))}
        <span className="text-xs text-muted-foreground ml-2 capitalize">{step}</span>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {step === "select" && (
          <motion.div key="select" initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:8 }}>
            <DraftTypeSelector selected={draftType} onSelect={handleTypeSelect} />
          </motion.div>
        )}
        {step === "form" && draftType && (
          <motion.div key="form" initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:8 }}
            className="p-5 rounded-2xl border border-border bg-card">
            <DraftForm
              draftType={draftType}
              fields={fields}
              lang="en"
              onSubmit={handleFormSubmit}
              loading={loading}
            />
          </motion.div>
        )}
        {step === "output" && result && draftType && (
          <motion.div key="output" initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:8 }}>
            <DraftOutput
              content={result.content}
              draftType={draftType}
              wordCount={result.word_count}
              onReset={() => { setStep("select"); setResult(null) }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
