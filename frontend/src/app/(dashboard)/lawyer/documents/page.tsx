"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UploadZone } from "@/components/documents/upload-zone"
import { UploadProgress, type UploadStage } from "@/components/documents/upload-progress"
import { AnalysisCard, type AnalysisResult } from "@/components/documents/analysis-card"
import { DocumentList } from "@/components/documents/document-list"
import { useUser } from "@/hooks/use-user"
import { ArrowLeft, FileSearch } from "lucide-react"

export default function LawyerDocumentsPage() {
  const { profile } = useUser()
  const [stage, setStage] = useState<UploadStage | null>(null)
  const [fileName, setFileName] = useState("")
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
  const [selectedDoc, setSelectedDoc] = useState<any>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [loadingDoc, setLoadingDoc] = useState(false)

  async function handleFile(file: File) {
    if (!profile) return
    setFileName(file.name)
    setResult(null)
    setSelectedDoc(null)
    setStage("uploading")

    const form = new FormData()
    form.append("file", file)
    form.append("user_id", profile.id)
    form.append("language", "en")

    try {
      setTimeout(() => setStage("extracting"), 600)
      setTimeout(() => setStage("analysing"), 1800)

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/documents/upload`,
        { method: "POST", body: form }
      )
      if (!res.ok) throw new Error((await res.json()).detail ?? "Upload failed")
      const data = await res.json()
      setStage("done")
      setResult(data)
      setRefreshKey(k => k + 1)
    } catch {
      setStage("error")
    }
  }

  async function handleSelectDoc(docId: string) {
    if (!profile) return
    setSelectedDocId(docId)
    setResult(null)
    setStage(null)
    setLoadingDoc(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/documents/${docId}?user_id=${profile.id}`
      )
      const data = await res.json()
      setSelectedDoc(data)
    } catch {}
    setLoadingDoc(false)
  }

  function reset() {
    setStage(null)
    setResult(null)
    setFileName("")
    setSelectedDoc(null)
    setSelectedDocId(null)
  }

  const showAnalysis = (result && stage === "done") || selectedDoc

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left — Upload panel */}
        <div className="space-y-5">
          <div>
            <h1 className="text-xl font-semibold">Document intelligence</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Upload case files, judgments, contracts for instant AI analysis
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!stage ? (
              <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <UploadZone onFile={handleFile} />
              </motion.div>
            ) : (
              <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
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

          {/* Documents list */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Case documents</p>
            <DocumentList
              onSelect={handleSelectDoc}
              refreshTrigger={refreshKey}
            />
          </div>
        </div>

        {/* Right — Analysis panel */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold">Analysis</h2>

          <AnimatePresence mode="wait">
            {loadingDoc ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 rounded-xl bg-secondary animate-pulse" />
                ))}
              </motion.div>
            ) : showAnalysis ? (
              <motion.div key="analysis" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="p-5 rounded-2xl border border-border bg-card space-y-4">
                {selectedDoc && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground truncate">{selectedDoc.file_name}</p>
                    <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      Clear
                    </button>
                  </div>
                )}
                <AnalysisCard
                  result={result ?? {
                    document_id: selectedDoc?.id,
                    file_name: selectedDoc?.file_name,
                    file_size: selectedDoc?.file_size,
                    ocr_success: !!selectedDoc?.ocr_text,
                    summary: selectedDoc?.summary ?? "No summary available.",
                    document_type: "Document",
                    parties: [],
                    ipc_sections: [],
                    key_dates: [],
                    action_required: "",
                    urgency: "low",
                    lawyer_needed: false,
                    key_clauses: [],
                    risk_flags: [],
                  }}
                />
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground border border-dashed border-border rounded-2xl">
                <FileSearch className="w-8 h-8 mb-3 opacity-30" />
                <p className="text-sm">Upload a document or select one from the list</p>
                <p className="text-xs mt-1 opacity-60">AI will extract parties, sections, dates, and risks</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  )
}
