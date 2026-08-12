"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Tables } from "@/types/database"

export function useUser() {
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false

    async function loadProfile(userId: string) {
      const { data, error } = await supabase
        .from("profiles").select("*").eq("id", userId).single()

      if (cancelled) return

      if (error) {
        // Surface the real reason instead of silently leaving profile null.
        console.error("[useUser] Failed to load profile:", error.message, error)
        setProfile(null)
        setError(error.message)
        setLoading(false)
        return
      }

      setProfile(data)
      setError(null)
      setLoading(false)
    }

    supabase.auth.getUser().then(({ data: { user }, error: userError }) => {
      if (cancelled) return
      if (userError || !user) {
        if (userError) console.error("[useUser] getUser error:", userError.message)
        setLoading(false)
        return
      }
      loadProfile(user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  return { profile, loading, error }
}