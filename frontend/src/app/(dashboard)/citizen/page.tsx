import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function CitizenDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  const name = profile?.full_name?.split(" ")[0] ?? "there"

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div className="pt-2">
        <h1 className="text-2xl font-semibold">Namaste, {name} 🙏</h1>
        <p className="text-muted-foreground text-sm mt-1">How can we help you today?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { title: "Ask a legal question", desc: "Get AI-powered answers in Hindi or English", href: "/citizen/chat", emoji: "💬", color: "border-violet-500/30 bg-violet-500/5 hover:border-violet-500/50" },
          { title: "Upload a document", desc: "Summarise FIRs, legal notices, papers", href: "/citizen/documents", emoji: "📄", color: "border-teal-500/30 bg-teal-500/5 hover:border-teal-500/50" },
          { title: "Know your rights", desc: "Understand IPC sections and your rights", href: "/citizen/rights", emoji: "⚖️", color: "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50" },
          { title: "Draft a complaint", desc: "RTI, FIR, consumer complaint, affidavit", href: "/citizen/draft", emoji: "✍️", color: "border-blue-500/30 bg-blue-500/5 hover:border-blue-500/50" },
        ].map(card => (
          <Link key={card.href} href={card.href}
            className={`p-5 rounded-xl border ${card.color} transition-all block group`}>
            <div className="text-2xl mb-2">{card.emoji}</div>
            <h3 className="font-medium text-sm">{card.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
          </Link>
        ))}
      </div>

      <div className="p-4 rounded-xl border border-border bg-card">
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">Recent activity</p>
        <p className="text-sm text-muted-foreground">No activity yet. Start by asking a question above.</p>
      </div>
    </div>
  )
}
