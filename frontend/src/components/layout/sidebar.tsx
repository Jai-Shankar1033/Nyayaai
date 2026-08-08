"use client"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  MessageSquare, FileText, Search, Scale, BookOpen,
  ChevronLeft, ChevronRight, LogOut, Home, GitFork,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import type { Tables } from "@/types/database"

const CITIZEN_NAV = [
  { href: "/citizen", icon: Home, label: "Home" },
  { href: "/citizen/chat", icon: MessageSquare, label: "Legal chat" },
  { href: "/citizen/documents", icon: FileText, label: "My documents" },
  { href: "/citizen/chat", icon: BookOpen, label: "Know your rights" },
  { href: "/citizen/draft", icon: Scale, label: "Draft documents" },
]

const LAWYER_NAV = [
  { href: "/lawyer", icon: Home, label: "Dashboard" },
  { href: "/lawyer/chat", icon: MessageSquare, label: "AI chat" },
  { href: "/lawyer/research", icon: Search, label: "Research" },
  { href: "/lawyer/documents", icon: FileText, label: "Documents" },
  { href: "/lawyer/documents", icon: Scale, label: "Cases" },
  { href: "/lawyer/draft", icon: BookOpen, label: "Draft" },
  { href: "/lawyer/citations", icon: GitFork, label: "Citation graph" },
]

interface SidebarProps {
  profile: Tables<"profiles"> | null
}

export function Sidebar({ profile }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const nav = profile?.role === "lawyer" ? LAWYER_NAV : CITIZEN_NAV

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="relative flex flex-col h-screen bg-nyaya-sidebar border-r border-border/20 overflow-hidden shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border/20">
        <div className="w-7 h-7 rounded-lg nyaya-gradient flex items-center justify-center shrink-0">
          <Scale className="w-4 h-4 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="font-semibold text-sm text-white whitespace-nowrap"
            >
              न्याय AI
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/citizen" && href !== "/lawyer" && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group",
                active
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )
        })}
      </nav>

      {/* User + sign out */}
      <div className="px-2 py-3 border-t border-border/20 space-y-0.5">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Sign out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.aside>
  )
}