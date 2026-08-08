"use client"
import { useCallback, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, FileText, X, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadZoneProps {
  onFile: (file: File) => void
  disabled?: boolean
}

const ACCEPTED = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
const MAX_MB = 20

export function UploadZone({ onFile, disabled }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function validate(file: File): string | null {
    if (!ACCEPTED.includes(file.type)) return "Only PDF, JPEG, and PNG files are supported."
    if (file.size > MAX_MB * 1024 * 1024) return `File too large. Maximum size is ${MAX_MB} MB.`
    return null
  }

  function handleFile(file: File) {
    const err = validate(file)
    if (err) { setError(err); return }
    setError(null)
    onFile(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (disabled) return
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [disabled])

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ""
  }

  return (
    <div className="space-y-2">
      <motion.label
        onDragOver={e => { e.preventDefault(); if (!disabled) setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        animate={{ scale: dragging ? 1.01 : 1 }}
        className={cn(
          "flex flex-col items-center justify-center gap-3 w-full",
          "min-h-[180px] rounded-2xl border-2 border-dashed cursor-pointer",
          "transition-colors duration-150",
          dragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-secondary/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          type="file"
          className="sr-only"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleInput}
          disabled={disabled}
        />
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
          dragging ? "bg-primary/20" : "bg-secondary"
        )}>
          <Upload className={cn("w-5 h-5", dragging ? "text-primary" : "text-muted-foreground")} />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-medium">
            {dragging ? "Drop to upload" : "Drag a file here, or click to browse"}
          </p>
          <p className="text-xs text-muted-foreground">PDF, JPEG, PNG · Max {MAX_MB} MB</p>
        </div>
      </motion.label>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-xs text-destructive px-1"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
