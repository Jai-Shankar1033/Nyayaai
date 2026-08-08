"use client"
import { motion } from "framer-motion"
import { FileText, CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export type UploadStage =
  | "uploading"
  | "extracting"
  | "analysing"
  | "done"
  | "error"

const STAGES: { key: UploadStage; label: string; hint: string }[] = [
  { key: "uploading",   label: "Uploading file",         hint: "Sending to secure storage…" },
  { key: "extracting",  label: "Extracting text",         hint: "Reading document contents…" },
  { key: "analysing",   label: "AI analysis",             hint: "Finding parties, sections, dates…" },
  { key: "done",        label: "Complete",                hint: "Document ready" },
]

const ORDER: UploadStage[] = ["uploading", "extracting", "analysing", "done"]

interface UploadProgressProps {
  stage: UploadStage
  fileName: string
}

export function UploadProgress({ stage, fileName }: UploadProgressProps) {
  const currentIdx = ORDER.indexOf(stage)
  const isError = stage === "error"

  return (
    <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{fileName}</p>
          <p className="text-xs text-muted-foreground">
            {isError ? "Processing failed" : STAGES.find(s => s.key === stage)?.hint}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", isError ? "bg-destructive" : "bg-primary")}
          initial={{ width: "5%" }}
          animate={{
            width: isError ? "100%" : stage === "done"
              ? "100%"
              : `${(currentIdx / (ORDER.length - 1)) * 85 + 5}%`
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Stage steps */}
      <div className="flex gap-2">
        {STAGES.map((s, i) => {
          const done = !isError && ORDER.indexOf(s.key) < currentIdx
          const active = !isError && s.key === stage
          return (
            <div key={s.key} className="flex-1 space-y-1">
              <div className={cn(
                "h-0.5 rounded-full transition-colors duration-300",
                done || (active && s.key === "done") ? "bg-primary" :
                active ? "bg-primary/60" : "bg-border"
              )} />
              <p className={cn(
                "text-[10px] transition-colors",
                active ? "text-primary font-medium" :
                done ? "text-muted-foreground" : "text-muted-foreground/50"
              )}>
                {s.label}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
