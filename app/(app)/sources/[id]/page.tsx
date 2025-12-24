"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getMoneySource, getMoneySourceBalance, getTransactionsBySource, getCategoriesByUser } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TransactionRow } from "@/components/transaction-row"
import { formatCurrency, formatDate } from "@/lib/format"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useUser } from "@/components/user-provider"
import type { Category, MoneySource, Transaction } from "@/lib/types"

export default function SourceDetailPage() {
  const { id } = useParams()
  const { userId } = useUser()
  const [source, setSource] = useState<MoneySource | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [currentBalance, setCurrentBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId || !id) return
    let active = true
    async function load() {
      setLoading(true)
      const [loadedSource, loadedTx, loadedBalance, loadedCategories] = await Promise.all([
        getMoneySource(id as string),
        getTransactionsBySource(id as string),
        getMoneySourceBalance(id as string),
        getCategoriesByUser(userId),
      ])
      if (!active) return
      setSource(loadedSource)
      setTransactions(loadedTx)
      setCurrentBalance(loadedBalance)
      setCategories(loadedCategories)
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [userId, id])

  if (loading) return null

  if (!source) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">Source not found</p>
        <Link href="/sources">
          <Button>Back to Sources</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{source.name}</h1>
        <p className="text-muted-foreground mt-2">
          {source.ownerType === "personal" ? "Personal" : "Company"} • {source.currency}
        </p>
      </div>

      {/* Balance Card */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentBalance, source.currency)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Initial Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(source.initialAmount, source.currency)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Change</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                currentBalance - source.initialAmount >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {currentBalance - source.initialAmount >= 0 ? "+" : ""}
              {formatCurrency(currentBalance - source.initialAmount, source.currency)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created</span>
            <span>{formatDate(source.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Transactions</span>
            <span>{transactions.length}</span>
          </div>
        </CardContent>
      </Card>

      {/* Transactions */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Transactions</h2>
        <div className="border rounded-lg bg-card">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No transactions yet</div>
          ) : (
            <div>
              {transactions.slice(0, 50).map((tx) => (
                <TransactionRow
                  key={tx.id}
                  transaction={tx}
                  sourceName={source.name}
                  currency={source.currency}
                  categoryName={categories.find((c) => c.id === tx.categoryId)?.name || null}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
