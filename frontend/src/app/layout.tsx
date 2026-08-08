import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { ThemeProvider } from "@/components/layout/theme-provider"
import { ToastProvider } from "@/components/ui/toast"
import "./globals.css"

export const metadata: Metadata = {
  title: { default: "NyayaAI", template: "%s — NyayaAI" },
  description: "AI-powered legal intelligence for every Indian. Hindi support, document analysis, and precedent research.",
  keywords: ["legal AI", "India", "NyayaAI", "court", "lawyer", "IPC", "judgment", "Hindi"],
  openGraph: {
    title: "NyayaAI — India's Legal Intelligence Platform",
    description: "AI legal assistant for citizens and lawyers. Ask in Hindi, get cited answers.",
    type: "website",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
