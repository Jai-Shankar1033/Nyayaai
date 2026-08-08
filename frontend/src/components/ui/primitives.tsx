import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

// ── StatCard ────────────────────────────────────────────────────
interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: { value: number; label: string }
  color?: "purple" | "teal" | "amber" | "default"
}

const COLOR_MAP = {
  purple:  "bg-violet-500/10 border-violet-500/20 text-violet-600 dark:text-violet-400",
  teal:    "bg-teal-500/10 border-teal-500/20 text-teal-600 dark:text-teal-400",
  amber:   "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
  default: "bg-primary/10 border-primary/20 text-primary",
}

export function StatCard({ label, value, icon, trend, color = "default" }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl border border-border bg-card space-y-3"
    >
      {icon && (
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center border", COLOR_MAP[color])}>
          {icon}
        </div>
      )}
      <div>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
      {trend && (
        <p className={cn(
          "text-xs font-medium",
          trend.value >= 0 ? "text-teal-600 dark:text-teal-400" : "text-destructive"
        )}>
          {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
        </p>
      )}
    </motion.div>
  )
}

// ── Badge ───────────────────────────────────────────────────────
type BadgeVariant = "default" | "success" | "warning" | "error" | "info" | "outline"

const BADGE_VARIANTS: Record<BadgeVariant, string> = {
  default: "bg-primary/10 text-primary border-primary/20",
  success: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  error:   "bg-destructive/10 text-destructive border-destructive/20",
  info:    "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  outline: "border-border text-muted-foreground",
}

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      BADGE_VARIANTS[variant],
      className
    )}>
      {children}
    </span>
  )
}

// ── Divider ─────────────────────────────────────────────────────
export function Divider({ label }: { label?: string }) {
  if (!label) return <hr className="border-border" />
  return (
    <div className="flex items-center gap-3">
      <hr className="flex-1 border-border" />
      <span className="text-xs text-muted-foreground">{label}</span>
      <hr className="flex-1 border-border" />
    </div>
  )
}

// ── Kbd ─────────────────────────────────────────────────────────
export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded border border-border bg-secondary text-muted-foreground">
      {children}
    </kbd>
  )
}
