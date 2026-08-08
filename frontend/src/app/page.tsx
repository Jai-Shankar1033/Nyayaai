"use client"
import { motion } from "framer-motion"
import Link from "next/link"
import { Scale, MessageSquare, FileText, Search, ArrowRight, Shield, Zap, Globe } from "lucide-react"

const FEATURES = [
  { icon: <MessageSquare className="w-5 h-5" />, title: "AI Legal Chat", desc: "Ask in Hindi or English. Get answers with citations from real Supreme Court judgments.", color: "text-violet-400" },
  { icon: <FileText className="w-5 h-5" />, title: "Document Analysis", desc: "Upload any FIR, notice or contract. AI extracts parties, sections, risks and next steps.", color: "text-teal-400" },
  { icon: <Search className="w-5 h-5" />, title: "Judgment Research", desc: "Semantic search over 20+ landmark SC judgments. Find precedents in seconds.", color: "text-amber-400" },
  { icon: <Scale className="w-5 h-5" />, title: "Draft Generator", desc: "Generate RTI, bail applications, legal notices and affidavits - ready to submit.", color: "text-blue-400" },
]

const STATS = [
  { value: "20+", label: "SC judgments" },
  { value: "7",   label: "Document types" },
  { value: "5+",  label: "Indian languages" },
  { value: "RAG", label: "AI architecture" },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg nyaya-gradient flex items-center justify-center">
            <Scale className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm">NyayaAI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login?role=citizen" className="btn-ghost text-sm">Sign in</Link>
          <Link href="/signup?role=citizen" className="btn-primary text-sm">Get started</Link>
        </div>
      </nav>

      <section className="flex flex-col items-center text-center px-6 pt-16 pb-24 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-xs text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse-slow" />
            Powered by RAG · Ollama · Gemini
          </div>
          <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight leading-tight">
            Legal intelligence<br />
            <span className="text-gradient">for every Indian</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            AI-powered legal assistance in Hindi and English. Cited answers, document analysis, judgment research, and draft generation - all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/signup?role=citizen" className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl nyaya-gradient text-white font-medium hover:opacity-90 transition-opacity">
              I need legal help <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/signup?role=lawyer" className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border hover:border-primary/40 font-medium transition-colors">
              I am a lawyer
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">Free for citizens · No account needed to browse</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }} className="grid grid-cols-4 gap-6 mt-16 pt-10 border-t border-border w-full max-w-lg">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-xl font-semibold text-gradient">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      <section className="px-6 pb-24 max-w-5xl mx-auto">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-2xl font-semibold">Everything you need</h2>
          <p className="text-muted-foreground text-sm">One platform. Citizens, lawyers, and corporates.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.3 }} className="p-5 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors space-y-3 group">
              <div className={`${f.color} transition-transform group-hover:scale-110`}>{f.icon}</div>
              <div className="space-y-1">
                <h3 className="font-medium text-sm">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-t border-border py-10 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-8 text-center">
          {[
            { icon: <Shield className="w-4 h-4" />, text: "RLS-protected data" },
            { icon: <Zap className="w-4 h-4" />, text: "Runs on local Ollama - no data sent to cloud" },
            { icon: <Globe className="w-4 h-4" />, text: "Hindi, Tamil, Telugu, Bengali" },
          ].map(item => (
            <div key={item.text} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="text-primary">{item.icon}</span>
              {item.text}
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-xl mx-auto space-y-5">
          <h2 className="text-2xl font-semibold">Justice for every Indian</h2>
          <p className="text-muted-foreground text-sm">No matter your language, no matter your background - you deserve to understand your legal rights.</p>
          <Link href="/signup?role=citizen" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl nyaya-gradient text-white font-medium hover:opacity-90 transition-opacity">
            Start for free <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>
    </div>
  )
}
