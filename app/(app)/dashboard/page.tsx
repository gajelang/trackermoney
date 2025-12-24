"use client"

import { useEffect, useState } from "react"
import {
  getMoneySourcesByUser,
  calculateDashboardTotalsFromData,
  computeSourceStats,
  getTransactionsByUser,
} from "@/lib/store"
import { DashboardStats } from "@/components/dashboard-stats"
import { MoneySourceCard } from "@/components/money-source-card"
import Link from "next/link"
import { Plus, ArrowDownUp } from "lucide-react"
import { useUser } from "@/components/user-provider"
import { TransactionForm } from "@/components/transaction-form"
import type { MoneySourceWithBalance } from "@/lib/types"

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
  const [sources, setSources] = useState<MoneySourceWithBalance[]>([])
  const [loading, setLoading] = useState(true)
  const [showTransactionModal, setShowTransactionModal] = useState(false)

  const loadData = async (activeRef?: { active: boolean }) => {
    if (!userId) return
    setLoading(true)
    const [moneySources, transactions] = await Promise.all([
      getMoneySourcesByUser(userId),
      getTransactionsByUser(userId),
    ])
    const stats = computeSourceStats(moneySources, transactions)
    const dashboardTotals = calculateDashboardTotalsFromData(moneySources, transactions)
    if (activeRef && !activeRef.active) return
    setTotals(dashboardTotals)
    setSources(
      moneySources.map((s, index) => ({
        ...s,
        currentBalance: stats[s.id]?.balance ?? s.initialAmount,
        transactionCount: stats[s.id]?.count ?? 0,
      })),
    )
    setLoading(false)
  }

  useEffect(() => {
    if (!userId) return
    const activeRef = { active: true }
    loadData(activeRef)
    return () => {
      activeRef.active = false
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
          <button
            type="button"
            onClick={() => setShowTransactionModal(true)}
            className="flex-1 min-w-32 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add</span>
          </button>
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

      {showTransactionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-card p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Add Transaction</h2>
                <p className="text-sm text-muted-foreground">Record income or expense.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowTransactionModal(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="mt-4">
              <TransactionForm
                userId={userId}
                onSuccess={async () => {
                  setShowTransactionModal(false)
                  await loadData()
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
