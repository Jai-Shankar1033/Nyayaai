"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Copy, Check, Download, RotateCcw } from "lucide-react"

interface DraftOutputProps {
  content: string
  draftType: string
  wordCount: number
  onReset: () => void
}

export function DraftOutput({ content, draftType, wordCount, onReset }: DraftOutputProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${draftType}-nyayaai.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-500" />
          <span className="text-xs text-muted-foreground">{wordCount} words · Ready to use</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> New draft
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <Download className="w-3 h-3" /> Download
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs bg-primary text-primary-foreground px-2.5 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            {copied
              ? <><Check className="w-3 h-3" /> Copied!</>
              : <><Copy className="w-3 h-3" /> Copy</>
            }
          </button>
        </div>
      </div>

      {/* Draft content */}
      <div className="relative">
        <pre className="w-full p-4 rounded-xl border border-border bg-secondary/30 text-sm leading-relaxed whitespace-pre-wrap font-mono overflow-y-auto max-h-[520px]">
          {content}
        </pre>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
        ⚠️ This draft is AI-generated. Review carefully and consult a licensed advocate before submitting to any authority or court.
      </p>
    </motion.div>
  )
}
