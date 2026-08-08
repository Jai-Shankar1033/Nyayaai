"use client"
import { useState } from "react"
import { CitationGraph } from "@/components/graph/citation-graph"
import { Search } from "lucide-react"

export default function CitationGraphPage() {
  const [query, setQuery] = useState("")
  const [activeQuery, setActiveQuery] = useState("")

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setActiveQuery(query.trim())
  }

  const QUICK = ["bail rights", "women rights", "Article 21 privacy", "arrest guidelines", "murder IPC 302"]

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Citation graph</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          How Supreme Court judgments cite and follow each other — drag nodes, hover for details
        </p>
      </div>

      {/* Search filter */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Filter graph by topic — e.g. bail, arrest, women rights"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50" />
        </div>
        <button type="submit"
          className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          Filter
        </button>
        {activeQuery && (
          <button type="button" onClick={() => { setQuery(""); setActiveQuery("") }}
            className="px-3 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">
            Clear
          </button>
        )}
      </form>

      {/* Quick filters */}
      <div className="flex flex-wrap gap-2">
        {QUICK.map(q => (
          <button key={q} onClick={() => { setQuery(q); setActiveQuery(q) }}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              activeQuery === q
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}>
            {q}
          </button>
        ))}
      </div>

      {/* Graph */}
      <CitationGraph query={activeQuery || undefined} />

      {/* Info box */}
      <div className="p-4 rounded-xl border border-border bg-card text-sm space-y-1.5">
        <p className="font-medium text-xs text-muted-foreground uppercase tracking-wide">How to read this graph</p>
        <p className="text-sm text-muted-foreground">Each node is a Supreme Court judgment. Arrows show citation direction — pointing from newer judgment to the one it cites. Solid = "followed", dashed red = "distinguished". Click a topic filter to highlight the relevant subgraph.</p>
      </div>
    </div>
  )
}
