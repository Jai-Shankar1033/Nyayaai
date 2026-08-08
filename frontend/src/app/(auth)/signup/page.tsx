"use client"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function SignupPage() {
  const router = useRouter()
  const params = useSearchParams()
  const role = (params.get("role") as "citizen" | "lawyer") ?? "citizen"
  const [form, setForm] = useState({ email: "", password: "", full_name: "", bar_council_id: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data, error: signupError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name, role } },
    })
    if (signupError) { setError(signupError.message); setLoading(false); return }
    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        email: form.email,
        full_name: form.full_name,
        role,
        language: "en",
        bar_council_id: role === "lawyer" ? form.bar_council_id : null,
      })
    }
    router.push(`/${role}`)
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold">Create account</h1>
          <p className="text-sm text-muted-foreground">
            {role === "lawyer" ? "Lawyer workspace" : "Free legal assistance"}
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Full name</label>
            <input type="text" required
              value={form.full_name} onChange={e => setForm(f => ({...f, full_name: e.target.value}))}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Your name" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <input type="email" required
              value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="you@example.com" />
          </div>
          {role === "lawyer" && (
            <div className="space-y-1">
              <label className="text-sm font-medium">Bar Council ID</label>
              <input type="text"
                value={form.bar_council_id} onChange={e => setForm(f => ({...f, bar_council_id: e.target.value}))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="MH/1234/2020" />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-sm font-medium">Password</label>
            <input type="password" required minLength={8}
              value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Min 8 characters" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href={`/login?role=${role}`} className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
