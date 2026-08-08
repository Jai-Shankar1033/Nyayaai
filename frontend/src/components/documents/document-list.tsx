"use client"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, Trash2, Clock, CheckCircle, Loader } from "lucide-react"
import { useUser } from "@/hooks/use-user"
import { cn } from "@/lib/utils"

interface Doc {
  id: string
  file_name: string
  file_size: number
  summary: string | null
  embedding_status: string
  created_at: string
}

interface DocumentListProps {
  onSelect?: (docId: string) => void
  refreshTrigger?: number
}

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1024 ** 2) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1024 ** 2).toFixed(1)} MB`
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function DocumentList({ onSelect, refreshTrigger }: DocumentListProps) {
  const { profile } = useUser()
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function load() {
    if (!profile) return
    setLoading(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/documents/list?user_id=${profile.id}`
      )
      const data = await res.json()
      setDocs(data.documents ?? [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [profile, refreshTrigger])

  async function handleDelete(e: React.MouseEvent, docId: string) {
    e.stopPropagation()
    if (!profile) return
    setDeleting(docId)
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/documents/${docId}?user_id=${profile.id}`,
        { method: "DELETE" }
      )
      setDocs(d => d.filter(doc => doc.id !== docId))
    } catch {}
    setDeleting(null)
  }

  if (loading) return (
    <div className="space-y-2">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-16 rounded-xl border border-border bg-card animate-pulse" />
      ))}
    </div>
  )

  if (docs.length === 0) return (
    <div className="text-center py-10 text-muted-foreground">
      <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
      <p className="text-sm">No documents uploaded yet.</p>
    </div>
  )

  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {docs.map((doc, i) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => onSelect?.(doc.id)}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl border border-border bg-card",
              "hover:border-primary/30 transition-colors cursor-pointer group"
            )}
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{doc.file_name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {doc.summary ?? "Processing…"} · {formatBytes(doc.file_size)}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {timeAgo(doc.created_at)}
              </div>
              {doc.embedding_status === "done"
                ? <CheckCircle className="w-3.5 h-3.5 text-teal-500" />
                : <Loader className="w-3.5 h-3.5 text-muted-foreground animate-spin" />
              }
              <button
                onClick={e => handleDelete(e, doc.id)}
                disabled={deleting === doc.id}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
