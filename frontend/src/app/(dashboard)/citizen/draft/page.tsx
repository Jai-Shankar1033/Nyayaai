"use client"
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { DraftTypeSelector } from "@/components/draft/draft-type-selector"
import { DraftForm } from "@/components/draft/draft-form"
import { DraftOutput } from "@/components/draft/draft-output"
import { LanguageToggle } from "@/components/chat/language-toggle"
import { useLanguage } from "@/hooks/use-language"
import { useUser } from "@/hooks/use-user"
import { ChevronLeft } from "lucide-react"

// Citizens only see simpler document types
const CITIZEN_TYPES = ["rti", "fir_complaint", "affidavit", "consumer_complaint"]

interface Field { key: string; label: string; required: boolean; placeholder: string }

export default function CitizenDraftPage() {
  const { profile } = useUser()
  const { lang, toggle } = useLanguage()
  const [step, setStep] = useState<"select" | "form" | "output">("select")
  const [draftType, setDraftType] = useState<string | null>(null)
  const [fields, setFields] = useState<Field[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ content: string; word_count: number } | null>(null)

  async function handleTypeSelect(type: string) {
    if (!CITIZEN_TYPES.includes(type)) return
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
          language: lang,
          user_id: profile?.id ?? "anonymous",
        }),
      })
      const data = await res.json()
      setResult({ content: data.content, word_count: data.word_count })
      setStep("output")
    } catch { alert("Generation failed. Is the backend running?") }
    setLoading(false)
  }

  const TITLES: Record<string, { en: string; hi: string }> = {
    select: { en: "What do you need?", hi: "आपको क्या चाहिए?" },
    form:   { en: "Fill in the details", hi: "विवरण भरें" },
    output: { en: "Your document is ready", hi: "आपका दस्तावेज़ तैयार है" },
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {step !== "select" && (
            <button onClick={() => { setStep("select"); setResult(null) }}
              className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-semibold">{TITLES[step][lang]}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {lang === "hi" ? "AI आपके लिए कानूनी दस्तावेज़ तैयार करेगा" : "AI will draft a ready-to-submit legal document"}
            </p>
          </div>
        </div>
        <LanguageToggle lang={lang} onToggle={toggle} />
      </div>

      <AnimatePresence mode="wait">
        {step === "select" && (
          <motion.div key="select" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            {/* Filter to citizen-appropriate types only */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { type:"rti",               emoji:"📋", en:"RTI Application",     hi:"RTI आवेदन",        desc_en:"Information from govt office", desc_hi:"सरकारी दफ्तर से जानकारी" },
                { type:"fir_complaint",     emoji:"🚔", en:"Police Complaint",    hi:"पुलिस शिकायत",     desc_en:"Report a crime to police",     desc_hi:"अपराध की शिकायत दर्ज करें" },
                { type:"affidavit",         emoji:"📜", en:"Affidavit",           hi:"शपथ पत्र",          desc_en:"Sworn statement for court",    desc_hi:"न्यायालय के लिए शपथ पत्र" },
                { type:"consumer_complaint",emoji:"🛒", en:"Consumer Complaint",  hi:"उपभोक्ता शिकायत",  desc_en:"Against company or product",   desc_hi:"कंपनी या उत्पाद की शिकायत" },
              ].map((t, i) => (
                <motion.button key={t.type}
                  initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*.06 }}
                  onClick={() => handleTypeSelect(t.type)}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
                >
                  <span className="text-2xl">{t.emoji}</span>
                  <div>
                    <p className="text-sm font-medium">{lang === "hi" ? t.hi : t.en}</p>
                    <p className="text-xs text-muted-foreground">{lang === "hi" ? t.desc_hi : t.desc_en}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
        {step === "form" && draftType && (
          <motion.div key="form" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="p-5 rounded-2xl border border-border bg-card">
            <DraftForm draftType={draftType} fields={fields} lang={lang}
              onSubmit={handleFormSubmit} loading={loading} />
          </motion.div>
        )}
        {step === "output" && result && draftType && (
          <motion.div key="output" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            <DraftOutput content={result.content} draftType={draftType}
              wordCount={result.word_count} onReset={() => { setStep("select"); setResult(null) }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
