"use client"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Typewriter } from "./typewriter"
import { Scale } from "lucide-react"

interface ChatBubbleProps {
  role: "user" | "assistant"
  content: string
  citations?: string[]
  isNew?: boolean
}

export function ChatBubble({ role, content, citations, isNew }: ChatBubbleProps) {
  const isUser = role === "user"

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex gap-3", isUser && "flex-row-reverse")}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full nyaya-gradient flex items-center justify-center shrink-0 mt-1">
          <Scale className="w-3.5 h-3.5 text-white" />
        </div>
      )}

      <div className={cn("max-w-[75%] space-y-1.5", isUser && "items-end flex flex-col")}>
        {/* Bubble */}
        <div className={cn(
          "rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-secondary text-foreground rounded-tl-sm"
        )}>
          {isNew && !isUser
            ? <Typewriter text={content} speed={8} />
            : content
          }
        </div>

        {/* Citations */}
        {citations && citations.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-1.5"
          >
            {citations.map((c, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {c}
              </span>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
