"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ExternalLink } from "lucide-react"

interface SearchResult {
  judgment_id: string
  case_name: string
  court: string
  year: number
  relevance_score: number
  excerpt: string
  citation?: string
  ipc_sections: string[]
}

export default function ResearchPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/research/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, top_k: 5, user_id: "user" }),
      })
      const data = await res.json()
      setResults(data.results ?? [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Judgment research</h1>
        <p className="text-sm text-muted-foreground mt-1">Semantic search across Supreme Court and High Court judgments</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="e.g. bail application IPC 302, custodial rights, sexual harassment workplace…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
          />
        </div>
        <button type="submit" disabled={loading || !query.trim()}
          className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
          Search
        </button>
      </form>

      {/* Suggested queries */}
      {!searched && (
        <div className="flex flex-wrap gap-2">
          {["bail IPC 302", "custodial torture Article 21", "workplace sexual harassment", "arrest without warrant", "domestic violence 498A"].map(q => (
            <button key={q} onClick={() => setQuery(q)}
              className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground transition-colors">
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 rounded-xl border border-border space-y-2 animate-pulse">
              <div className="h-4 bg-muted rounded w-2/3" />
              <div className="h-3 bg-muted rounded w-1/3" />
              <div className="h-3 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-4/5" />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {!loading && results.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <p className="text-xs text-muted-foreground">{results.length} judgment{results.length > 1 ? "s" : ""} found</p>
            {results.map((r, i) => (
              <motion.div
                key={r.judgment_id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-xl border border-border hover:border-primary/30 transition-colors bg-card space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-medium">{r.case_name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.court} · {r.year} {r.citation && `· ${r.citation}`}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
                    {Math.round(r.relevance_score * 100)}% match
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{r.excerpt}</p>
                {r.ipc_sections.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {r.ipc_sections.filter(Boolean).map(s => (
                      <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{s}</span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
        {!loading && searched && results.length === 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-muted-foreground text-center py-8">
            No judgments found. Try different keywords.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
