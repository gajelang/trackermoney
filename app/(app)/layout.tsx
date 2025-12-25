"use client"

import type React from "react"
import Link from "next/link"
import { Home, Send, TrendingUp, LogOut } from "lucide-react"
import { usePathname } from "next/navigation"
import { UserProvider, useUser } from "@/components/user-provider"

function UserGate({ children }: { children: React.ReactNode }) {
  const { loading, error } = useUser()

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="max-w-md rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center">
          <div className="text-lg font-semibold text-destructive">Failed to initialize</div>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <p className="mt-3 text-xs text-muted-foreground">Check Supabase tables and env vars.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/transactions", label: "Transactions", icon: TrendingUp },
    { href: "/sources", label: "Sources", icon: Send },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <UserProvider>
      <UserGate>
        <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">{children}</div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-card border-t border-border backdrop-blur-xl">
        <div className="flex items-center justify-around h-20">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex-1">
              <button
                className={`flex flex-col items-center justify-center h-20 gap-1 w-full transition-colors ${
                  isActive(href) ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label={label}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            </Link>
          ))}
        </div>
      </nav>

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex-col backdrop-blur-xl">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-primary">Money Tracker</h1>
          <p className="text-xs text-muted-foreground mt-1">Personal Finance</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <button
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                  isActive(href) ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors text-sm">
            <LogOut className="w-4 h-4" />
            <span>Preferences</span>
          </button>
        </div>
      </aside>

      {/* Desktop Content Offset */}
      <style>{`
        @media (min-width: 768px) {
          main {
            margin-left: 16rem;
          }
        }
      `}</style>
        </div>
      </UserGate>
    </UserProvider>
  )
}
