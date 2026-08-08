"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UploadZone } from "@/components/documents/upload-zone"
import { UploadProgress, type UploadStage } from "@/components/documents/upload-progress"
import { AnalysisCard, type AnalysisResult } from "@/components/documents/analysis-card"
import { DocumentList } from "@/components/documents/document-list"
import { useUser } from "@/hooks/use-user"
import { useLanguage } from "@/hooks/use-language"
import { LanguageToggle } from "@/components/chat/language-toggle"
import { ArrowLeft } from "lucide-react"

export default function CitizenDocumentsPage() {
  const { profile } = useUser()
  const { lang, toggle } = useLanguage()
  const [stage, setStage] = useState<UploadStage | null>(null)
  const [fileName, setFileName] = useState("")
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  async function handleFile(file: File) {
    if (!profile) return
    setFileName(file.name)
    setResult(null)
    setStage("uploading")

    const form = new FormData()
    form.append("file", file)
    form.append("user_id", profile.id)
    form.append("language", lang)

    try {
      // Simulate stage progression for UX
      setTimeout(() => setStage("extracting"), 600)
      setTimeout(() => setStage("analysing"), 1800)

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/documents/upload`,
        { method: "POST", body: form }
      )

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail ?? "Upload failed")
      }

      const data = await res.json()
      setStage("done")
      setResult(data)
      setRefreshKey(k => k + 1)
    } catch (e: any) {
      setStage("error")
      console.error(e)
    }
  }

  function reset() {
    setStage(null)
    setResult(null)
    setFileName("")
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            {lang === "hi" ? "दस्तावेज़ विश्लेषण" : "Document analysis"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {lang === "hi"
              ? "FIR, नोटिस, या कोई भी कानूनी कागज़ अपलोड करें"
              : "Upload any legal document — FIR, notice, order, contract"}
          </p>
        </div>
        <LanguageToggle lang={lang} onToggle={toggle} />
      </div>

      {/* Upload or progress */}
      <AnimatePresence mode="wait">
        {!stage ? (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <UploadZone onFile={handleFile} />
          </motion.div>
        ) : (
          <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <UploadProgress stage={stage} fileName={fileName} />
            {(stage === "done" || stage === "error") && (
              <button onClick={reset} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                {stage === "error" ? "Try again" : "Upload another"}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis result */}
      <AnimatePresence>
        {result && stage === "done" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                AI Analysis
              </p>
              <AnalysisCard result={result} showHindi={lang === "hi"} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Previous documents */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {lang === "hi" ? "पिछले दस्तावेज़" : "Previous documents"}
        </p>
        <DocumentList refreshTrigger={refreshKey} />
      </div>
    </div>
  )
}
