import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function LawyerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  const { count: caseCount } = await supabase.from("cases").select("*", { count: "exact", head: true }).eq("user_id", user.id)
  const { count: docCount } = await supabase.from("documents").select("*", { count: "exact", head: true }).eq("user_id", user.id)

  const name = profile?.full_name?.split(" ")[0] ?? "Advocate"

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between pt-2">
        <div>
          <h1 className="text-2xl font-semibold">Good morning, Adv. {name}</h1>
          <p className="text-muted-foreground text-sm mt-1">Your AI-powered legal workspace</p>
        </div>
        <div className="flex gap-3">
          {[{ label: "Cases", value: caseCount ?? 0 }, { label: "Documents", value: docCount ?? 0 }].map(s => (
            <div key={s.label} className="text-center px-4 py-2.5 rounded-xl border border-border bg-card min-w-[72px]">
              <div className="text-xl font-semibold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { title: "Research judgments", desc: "Semantic search across SC & HC cases", href: "/lawyer/research", emoji: "🔍", color: "border-violet-500/30 bg-violet-500/5 hover:border-violet-500/50" },
          { title: "AI legal chat", desc: "Ask about IPC, CrPC, precedents", href: "/lawyer/chat", emoji: "💬", color: "border-teal-500/30 bg-teal-500/5 hover:border-teal-500/50" },
          { title: "Draft generator", desc: "Petitions, bail applications, notices", href: "/lawyer/draft", emoji: "✍️", color: "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50" },
          { title: "Analyse document", desc: "Upload case file, get summary", href: "/lawyer/documents", emoji: "📄", color: "border-blue-500/30 bg-blue-500/5 hover:border-blue-500/50" },
          { title: "Contract review", desc: "Detect risky clauses, flag liabilities", href: "/lawyer/contracts", emoji: "📋", color: "border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50" },
          { title: "Case workspace", desc: "Manage files, notes, timeline", href: "/lawyer/cases", emoji: "🗂️", color: "border-border bg-card hover:border-primary/30" },
        ].map(card => (
          <Link key={card.href} href={card.href}
            className={`p-5 rounded-xl border ${card.color} transition-all block`}>
            <div className="text-2xl mb-2">{card.emoji}</div>
            <h3 className="font-medium text-sm">{card.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
