"use client"
import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

interface GraphNode {
  id: string
  label: string
  court: string
  year: number
  citation: string
  category: string
  color: string
  x?: number
  y?: number
  vx?: number
  vy?: number
}

interface GraphEdge {
  source: string
  target: string
  type: string
}

interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
  categories: { key: string; color: string }[]
}

const CATEGORY_LABELS: Record<string, string> = {
  fundamental_rights: "Fundamental Rights",
  criminal_law:       "Criminal Law",
  bail_rights:        "Bail & Liberty",
  women_rights:       "Women's Rights",
  environment:        "Environment",
  constitutional:     "Constitutional",
}

export function CitationGraph({ query }: { query?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [data, setData] = useState<GraphData | null>(null)
  const [loading, setLoading] = useState(true)
  const [hovered, setHovered] = useState<GraphNode | null>(null)
  const [tipPos, setTipPos] = useState<{ x: number; y: number } | null>(null)
  const nodesRef = useRef<GraphNode[]>([])
  const rafRef    = useRef(0)
  const dragRef   = useRef<GraphNode | null>(null)

  useEffect(() => {
    setLoading(true)
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/graph/citations${query ? `?query=${encodeURIComponent(query)}` : ""}`
    fetch(url)
      .then(r => r.json())
      .then((d: GraphData) => {
        setData(d)
        const W = 680, H = 420
        d.nodes.forEach((n, i) => {
          const angle = (i / d.nodes.length) * 2 * Math.PI
          n.x = W / 2 + 160 * Math.cos(angle) + (Math.random() - .5) * 40
          n.y = H / 2 + 140 * Math.sin(angle) + (Math.random() - .5) * 40
          n.vx = 0; n.vy = 0
        })
        nodesRef.current = d.nodes
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [query])

  useEffect(() => {
    if (!data || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")!
    const W = canvas.width, H = canvas.height

    function step() {
      const nodes = nodesRef.current
      // repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x! - nodes[i].x!
          const dy = nodes[j].y! - nodes[i].y!
          const d2 = dx * dx + dy * dy || 1
          const f = 2400 / d2
          nodes[i].vx! -= dx / Math.sqrt(d2) * f
          nodes[i].vy! -= dy / Math.sqrt(d2) * f
          nodes[j].vx! += dx / Math.sqrt(d2) * f
          nodes[j].vy! += dy / Math.sqrt(d2) * f
        }
        // gravity
        nodes[i].vx! += (W / 2 - nodes[i].x!) * 0.013
        nodes[i].vy! += (H / 2 - nodes[i].y!) * 0.013
      }
      // attraction
      data.edges.forEach(e => {
        const s = nodes.find(n => n.id === e.source)
        const t = nodes.find(n => n.id === e.target)
        if (!s || !t) return
        const dx = t.x! - s.x!, dy = t.y! - s.y!
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const f = dist * 0.019
        s.vx! += dx / dist * f; s.vy! += dy / dist * f
        t.vx! -= dx / dist * f; t.vy! -= dy / dist * f
      })
      // integrate
      nodes.forEach(n => {
        if (dragRef.current?.id === n.id) return
        n.vx! *= 0.72; n.vy! *= 0.72
        n.x = Math.max(48, Math.min(W - 48, n.x! + n.vx!))
        n.y = Math.max(28, Math.min(H - 28, n.y! + n.vy!))
      })
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)
      const dark = window.matchMedia("(prefers-color-scheme: dark)").matches
      const ec = dark ? "rgba(255,255,255,0.13)" : "rgba(0,0,0,0.10)"
      const lc = dark ? "rgba(255,255,255,0.80)" : "rgba(20,20,20,0.80)"
      const nodes = nodesRef.current

      data.edges.forEach(e => {
        const s = nodes.find(n => n.id === e.source)
        const t = nodes.find(n => n.id === e.target)
        if (!s || !t) return
        const dx = t.x! - s.x!, dy = t.y! - s.y!
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const r = 14
        const x1 = s.x! + dx / dist * r, y1 = s.y! + dy / dist * r
        const x2 = t.x! - dx / dist * (r + 6), y2 = t.y! - dy / dist * (r + 6)
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2)
        ctx.strokeStyle = e.type === "followed" ? ec : "rgba(239,68,68,0.28)"
        ctx.lineWidth = 1.2
        ctx.setLineDash(e.type === "distinguished" ? [4, 3] : [])
        ctx.stroke(); ctx.setLineDash([])
        const ang = Math.atan2(dy, dx)
        ctx.beginPath()
        ctx.moveTo(x2, y2)
        ctx.lineTo(x2 - 7 * Math.cos(ang - .4), y2 - 7 * Math.sin(ang - .4))
        ctx.lineTo(x2 - 7 * Math.cos(ang + .4), y2 - 7 * Math.sin(ang + .4))
        ctx.closePath(); ctx.fillStyle = ec; ctx.fill()
      })

      nodes.forEach(n => {
        const isH = hovered?.id === n.id
        const rad = isH ? 17 : 13
        if (isH) {
          ctx.beginPath(); ctx.arc(n.x!, n.y!, rad + 6, 0, 2 * Math.PI)
          ctx.fillStyle = n.color + "33"; ctx.fill()
        }
        ctx.beginPath(); ctx.arc(n.x!, n.y!, rad, 0, 2 * Math.PI)
        ctx.fillStyle = n.color + (isH ? "ff" : "cc"); ctx.fill()
        ctx.strokeStyle = dark ? "rgba(0,0,0,.4)" : "rgba(255,255,255,.8)"
        ctx.lineWidth = 2; ctx.stroke()
        const short = n.label.split(" v. ")[0].split(" ").slice(0, 2).join(" ")
        ctx.font = isH ? "bold 10px system-ui" : "10px system-ui"
        ctx.fillStyle = lc; ctx.textAlign = "center"
        ctx.fillText(short, n.x!, n.y! + rad + 12)
        ctx.fillText(String(n.year), n.x!, n.y! + rad + 22)
      })
    }

    function tick() { step(); draw(); rafRef.current = requestAnimationFrame(tick) }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [data, hovered])

  function nodeAt(cx: number, cy: number) {
    const rect = canvasRef.current!.getBoundingClientRect()
    const sx = canvasRef.current!.width / rect.width
    const sy = canvasRef.current!.height / rect.height
    const px = (cx - rect.left) * sx, py = (cy - rect.top) * sy
    return nodesRef.current.find(n => {
      const dx = n.x! - px, dy = n.y! - py
      return Math.sqrt(dx * dx + dy * dy) < 18
    }) ?? null
  }

  function onMove(e: React.MouseEvent) {
    const n = nodeAt(e.clientX, e.clientY)
    setHovered(n ?? null)
    setTipPos(n ? { x: e.clientX, y: e.clientY } : null)
    if (dragRef.current) {
      const rect = canvasRef.current!.getBoundingClientRect()
      const sx = canvasRef.current!.width / rect.width
      const sy = canvasRef.current!.height / rect.height
      dragRef.current.x = (e.clientX - rect.left) * sx
      dragRef.current.y = (e.clientY - rect.top) * sy
      dragRef.current.vx = 0; dragRef.current.vy = 0
    }
  }

  if (loading) return (
    <div className="h-[420px] rounded-2xl border border-border bg-secondary/20 flex items-center justify-center">
      <div className="flex gap-1.5">
        {[0,1,2].map(i => (
          <motion.div key={i} className="w-2 h-2 rounded-full bg-primary"
            animate={{ y: [0,-8,0] }} transition={{ duration:.6, delay:i*.1, repeat:Infinity }} />
        ))}
      </div>
    </div>
  )

  if (!data?.nodes.length) return (
    <div className="h-[420px] rounded-2xl border border-dashed border-border flex items-center justify-center text-sm text-muted-foreground">
      Seed the database to see citation graph
    </div>
  )

  return (
    <div className="space-y-3">
      <div className="relative rounded-2xl border border-border overflow-hidden bg-card">
        <canvas ref={canvasRef} width={680} height={420}
          className="w-full cursor-grab active:cursor-grabbing"
          onMouseMove={onMove}
          onMouseDown={e => { dragRef.current = nodeAt(e.clientX, e.clientY) }}
          onMouseUp={() => { dragRef.current = null }}
          onMouseLeave={() => { setHovered(null); setTipPos(null); dragRef.current = null }}
        />
        {hovered && tipPos && (
          <div className="fixed z-50 pointer-events-none bg-popover border border-border rounded-xl px-3 py-2.5 shadow-lg max-w-[240px]"
            style={{ left: tipPos.x + 14, top: tipPos.y - 8 }}>
            <p className="text-xs font-medium leading-tight">{hovered.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{hovered.court}, {hovered.year}</p>
            {hovered.citation && <p className="text-xs text-primary mt-0.5">{hovered.citation}</p>}
          </div>
        )}
        <p className="absolute bottom-2 right-3 text-[10px] text-muted-foreground/40">drag · hover for details</p>
      </div>
      <div className="flex flex-wrap gap-3 px-1">
        {data.categories.map(c => (
          <div key={c.key} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
            <span className="text-xs text-muted-foreground">{CATEGORY_LABELS[c.key] ?? c.key}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground px-1">
        Solid arrows = followed · Dashed red = distinguished · {data.nodes.length} judgments · {data.edges.length} citations
      </p>
    </div>
  )
}
