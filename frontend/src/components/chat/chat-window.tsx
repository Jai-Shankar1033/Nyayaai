"use client"
import { useEffect, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChatBubble } from "./chat-bubble"
import { ChatInput } from "./chat-input"
import { ThinkingIndicator } from "./thinking-indicator"
import { LanguageToggle } from "./language-toggle"
import { useLanguage } from "@/hooks/use-language"
import { useUser } from "@/hooks/use-user"
import { useChat } from "@/hooks/use-chat"
import { Square } from "lucide-react"

const SUGGESTED: Record<string, string[]> = {
  en: [
    "What are my rights if I am arrested?",
    "How do I file an RTI application?",
    "What is IPC Section 498A about?",
    "Can police enter my home without a warrant?",
    "How do I get anticipatory bail?",
    "What is the Vishaka guideline?",
  ],
  hi: [
    "अगर मुझे गिरफ्तार किया जाए तो मेरे क्या अधिकार हैं?",
    "RTI आवेदन कैसे दर्ज करें?",
    "IPC धारा 498A क्या है?",
    "क्या पुलिस बिना वारंट के मेरे घर में आ सकती है?",
    "जमानत कैसे मिलती है?",
    "विशाखा दिशानिर्देश क्या है?",
  ],
}

export function ChatWindow() {
  const bottomRef = useRef<HTMLDivElement>(null)
  const { lang, toggle, labels } = useLanguage()
  const { profile } = useUser()
  const { messages, thinking, sendMessage, clearMessages, stopGeneration } = useChat(
    profile?.id ?? "anonymous"
  )

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, thinking])

  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 shrink-0">
        <div>
          <h1 className="text-base font-semibold">
            {lang === "hi" ? "कानूनी सहायता" : "Legal AI Assistant"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {lang === "hi"
              ? "IPC, CrPC, संविधान के बारे में पूछें — उद्धरण के साथ जवाब"
              : "Ask about IPC, CrPC, Constitution — answers with citations"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-secondary"
            >
              Clear
            </button>
          )}
          <LanguageToggle lang={lang} onToggle={toggle} />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 min-h-0">
        {isEmpty && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 pt-6"
          >
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl nyaya-gradient flex items-center justify-center mx-auto shadow-lg">
                <span className="text-white text-2xl font-bold">न्</span>
              </div>
              <p className="font-medium">
                {lang === "hi" ? "नमस्ते! मैं NyayaAI हूं।" : "Hello! I'm NyayaAI."}
              </p>
              <p className="text-sm text-muted-foreground max-w-xs">
                {lang === "hi"
                  ? "भारतीय कानून के बारे में कोई भी सवाल पूछें।"
                  : "Ask me anything about Indian law — I'll cite real judgments."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTED[lang].map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q, lang)}
                  className="text-left text-xs px-3 py-2.5 rounded-xl border border-border bg-secondary/50 hover:border-primary/40 hover:bg-primary/5 transition-all text-muted-foreground hover:text-foreground"
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {messages.map(msg => (
          <ChatBubble key={msg.id} {...msg} />
        ))}

        <AnimatePresence>
          {thinking && messages[messages.length - 1]?.content === "" && (
            <ThinkingIndicator label={labels.thinking} />
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 pb-5 shrink-0 space-y-2">
        {thinking && (
          <div className="flex justify-center">
            <button
              onClick={stopGeneration}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-full border border-border hover:border-primary/30 transition-colors"
            >
              <Square className="w-3 h-3" /> Stop generating
            </button>
          </div>
        )}
        <ChatInput
          onSend={msg => sendMessage(msg, lang)}
          disabled={thinking}
          placeholder={labels.placeholder}
        />
        <p className="text-xs text-muted-foreground text-center">
          {lang === "hi"
            ? "NyayaAI केवल जानकारी देता है। गंभीर मामलों में वकील से सलाह लें।"
            : "NyayaAI provides legal information only. Consult a licensed advocate for serious matters."}
        </p>
      </div>
    </div>
  )
}
