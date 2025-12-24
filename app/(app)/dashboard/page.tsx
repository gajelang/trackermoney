"use client"

import { useEffect, useState } from "react"
import { getMoneySourcesByUser, getMoneySourceBalance, getDashboardTotals, getTransactionsBySource } from "@/lib/store"
import { DashboardStats } from "@/components/dashboard-stats"
import { MoneySourceCard } from "@/components/money-source-card"
import Link from "next/link"
import { Plus, ArrowDownUp } from "lucide-react"
import { useUser } from "@/components/user-provider"

export default function DashboardPage() {
  const { userId } = useUser()
  const [totals, setTotals] = useState({
    totalBalance: 0,
    personalBalance: 0,
    companyBalance: 0,
    monthIncome: 0,
    monthExpense: 0,
    monthNet: 0,
  })
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    let active = true
    async function load() {
      setLoading(true)
      const moneySources = await getMoneySourcesByUser(userId)
      const dashboardTotals = await getDashboardTotals(userId)
      const balances = await Promise.all(moneySources.map((s) => getMoneySourceBalance(s.id)))
      const transactionCounts = await Promise.all(
        moneySources.map(async (s) => (await getTransactionsBySource(s.id)).length),
      )
      if (!active) return
      setTotals(dashboardTotals)
      setSources(
        moneySources.map((s, index) => ({
          ...s,
          currentBalance: balances[index],
          transactionCount: transactionCounts[index],
        })),
      )
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [userId])

  if (!userId || loading) return null

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">Hi there!</h1>
          <p className="text-muted-foreground mt-2">Welcome back to your finances</p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          <Link href="/transactions/new" className="flex-1 min-w-32">
            <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-colors">
              <Plus className="w-5 h-5" />
              <span>Add</span>
            </button>
          </Link>
          <Link href="/transfers/new" className="flex-1 min-w-32">
            <button className="w-full bg-primary/10 hover:bg-primary/20 text-primary font-semibold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-colors border border-primary/20">
              <ArrowDownUp className="w-5 h-5" />
              <span>Transfer</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats {...totals} />

      {/* Money Sources Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Your Accounts</h2>
          <Link href="/sources" className="text-primary text-sm font-semibold hover:underline">
            View all
          </Link>
        </div>

        {sources.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-primary/20 rounded-2xl">
            <p className="text-muted-foreground mb-4">No accounts created yet</p>
            <Link href="/sources">
              <button className="inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90">
                Create Account
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {sources.map((source) => (
              <Link key={source.id} href={`/sources/${source.id}`}>
                <MoneySourceCard
                  source={source}
                  currentBalance={source.currentBalance}
                  transactionCount={source.transactionCount}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
