"use client"
import { motion } from "framer-motion"
import { AlertTriangle, CheckCircle, Scale, Calendar, Users, BookOpen, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

export interface AnalysisResult {
  document_id: string
  file_name: string
  file_size: number
  ocr_success: boolean
  summary: string
  summary_hindi?: string
  document_type: string
  parties: string[]
  ipc_sections: string[]
  key_dates: string[]
  action_required: string
  urgency: "low" | "medium" | "high"
  lawyer_needed: boolean
  key_clauses: string[]
  risk_flags: string[]
}

const URGENCY_STYLES = {
  low:    "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20",
  medium: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  high:   "bg-destructive/10 text-destructive border-destructive/20",
}

interface AnalysisCardProps {
  result: AnalysisResult
  showHindi?: boolean
}

export function AnalysisCard({ result, showHindi }: AnalysisCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              {result.document_type}
            </span>
            <span className={cn(
              "text-xs font-medium px-2.5 py-1 rounded-full border",
              URGENCY_STYLES[result.urgency]
            )}>
              {result.urgency === "high" ? "🔴" : result.urgency === "medium" ? "🟡" : "🟢"} {result.urgency} urgency
            </span>
          </div>
        </div>
        {result.lawyer_needed && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 shrink-0">
            <Scale className="w-3.5 h-3.5" />
            Lawyer advised
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Summary</p>
        <p className="text-sm leading-relaxed">{result.summary}</p>
        {showHindi && result.summary_hindi && (
          <p className="text-sm leading-relaxed text-muted-foreground border-t border-border pt-2 mt-2">
            {result.summary_hindi}
          </p>
        )}
      </div>

      {/* Action required */}
      {result.action_required && (
        <div className={cn(
          "flex gap-3 p-4 rounded-xl border",
          result.urgency === "high"
            ? "bg-destructive/5 border-destructive/20"
            : "bg-amber-500/5 border-amber-500/20"
        )}>
          <Zap className={cn(
            "w-4 h-4 shrink-0 mt-0.5",
            result.urgency === "high" ? "text-destructive" : "text-amber-600 dark:text-amber-400"
          )} />
          <div className="space-y-0.5">
            <p className="text-xs font-medium">Action required</p>
            <p className="text-sm">{result.action_required}</p>
          </div>
        </div>
      )}

      {/* Risk flags */}
      {result.risk_flags.length > 0 && (
        <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
            <p className="text-xs font-medium text-destructive">Risk flags</p>
          </div>
          <ul className="space-y-1.5">
            {result.risk_flags.map((f, i) => (
              <li key={i} className="text-sm flex gap-2">
                <span className="text-destructive shrink-0">•</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Grid: parties, sections, dates */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {result.parties.length > 0 && (
          <InfoBlock icon={<Users className="w-3.5 h-3.5" />} label="Parties">
            {result.parties.map((p, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded-lg bg-secondary text-foreground">{p}</span>
            ))}
          </InfoBlock>
        )}
        {result.ipc_sections.length > 0 && (
          <InfoBlock icon={<BookOpen className="w-3.5 h-3.5" />} label="Sections">
            {result.ipc_sections.map((s, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">{s}</span>
            ))}
          </InfoBlock>
        )}
        {result.key_dates.length > 0 && (
          <InfoBlock icon={<Calendar className="w-3.5 h-3.5" />} label="Key dates">
            {result.key_dates.map((d, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded-lg bg-secondary text-foreground">{d}</span>
            ))}
          </InfoBlock>
        )}
      </div>

      {/* Key clauses */}
      {result.key_clauses.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Key clauses</p>
          <div className="space-y-1.5">
            {result.key_clauses.map((c, i) => (
              <div key={i} className="flex gap-2 text-sm">
                <span className="text-muted-foreground shrink-0">{i + 1}.</span>
                <span>{c}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

function InfoBlock({ icon, label, children }: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="p-3 rounded-xl border border-border bg-card space-y-2">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}
