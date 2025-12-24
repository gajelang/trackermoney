"use client"

import { useEffect, useMemo, useState } from "react"
import { getTransactionsByUser, getMoneySourcesByUser, getCategoriesByUser } from "@/lib/store"
import { TransactionRow } from "@/components/transaction-row"
import { Input } from "@/components/ui/input"
import type { TransactionKind, OwnerType } from "@/lib/types"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useUser } from "@/components/user-provider"

export default function TransactionsPage() {
  const { userId } = useUser()
  const [ownerTypeFilter, setOwnerTypeFilter] = useState<OwnerType | "all">("all")
  const [kindFilter, setKindFilter] = useState<TransactionKind | "all">("all")
  const [searchNote, setSearchNote] = useState("")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [allTransactions, setAllTransactions] = useState([])
  const [moneySources, setMoneySources] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    let active = true
    async function load() {
      setLoading(true)
      const [txs, sources, cats] = await Promise.all([
        getTransactionsByUser(userId),
        getMoneySourcesByUser(userId),
        getCategoriesByUser(userId),
      ])
      if (!active) return
      setAllTransactions(txs)
      setMoneySources(sources)
      setCategories(cats)
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [userId])

  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((tx) => {
      const source = moneySources.find((s) => s.id === tx.sourceId)
      if (!source) return false

      // Filter by owner type
      if (ownerTypeFilter !== "all" && source.ownerType !== ownerTypeFilter) {
        return false
      }

      // Filter by transaction kind
      if (kindFilter !== "all" && tx.kind !== kindFilter) {
        return false
      }

      // Filter by note search
      if (searchNote && !tx.note?.toLowerCase().includes(searchNote.toLowerCase())) {
        return false
      }

      // Filter by date range
      const txDate = new Date(tx.occurredAt).getTime()
      if (fromDate) {
        const from = new Date(fromDate).getTime()
        if (txDate < from) return false
      }
      if (toDate) {
        const to = new Date(toDate)
        to.setHours(23, 59, 59, 999)
        if (txDate > to.getTime()) return false
      }

      return true
    })
  }, [allTransactions, moneySources, ownerTypeFilter, kindFilter, searchNote, fromDate, toDate])

  if (!userId || loading) return null

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-2">View and filter all transactions</p>
        </div>
        <Link href="/transactions/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">+ Add Transaction</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 border rounded-lg bg-card overflow-x-auto">
        <h3 className="font-semibold text-sm sm:text-base">Filters</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3">
          <div>
            <label className="text-xs sm:text-sm font-medium mb-1 block">Account Type</label>
            <select
              value={ownerTypeFilter}
              onChange={(e) => setOwnerTypeFilter(e.target.value as any)}
              className="w-full px-2 py-2 border rounded-md bg-background text-xs sm:text-sm"
            >
              <option value="all">All Types</option>
              <option value="personal">Personal</option>
              <option value="company">Company</option>
            </select>
          </div>

          <div>
            <label className="text-xs sm:text-sm font-medium mb-1 block">Transaction Type</label>
            <select
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value as any)}
              className="w-full px-2 py-2 border rounded-md bg-background text-xs sm:text-sm"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="transfer">Transfer</option>
              <option value="adjustment">Adjustment</option>
            </select>
          </div>

          <div>
            <label className="text-xs sm:text-sm font-medium mb-1 block">From Date</label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="text-xs sm:text-sm font-medium mb-1 block">To Date</label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="text-xs sm:text-sm font-medium mb-1 block">Search Note</label>
            <Input
              type="text"
              placeholder="Search..."
              value={searchNote}
              onChange={(e) => setSearchNote(e.target.value)}
              className="text-xs sm:text-sm"
            />
          </div>
        </div>

        <div className="text-xs sm:text-sm text-muted-foreground">
          Found {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Transactions List */}
      <div className="border rounded-lg bg-card overflow-x-auto">
        {filteredTransactions.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-sm text-muted-foreground">No transactions found</div>
        ) : (
          <div>
            {filteredTransactions.map((tx) => (
              <TransactionRow
                key={tx.id}
                transaction={tx}
                sourceName={moneySources.find((s) => s.id === tx.sourceId)?.name}
                currency={moneySources.find((s) => s.id === tx.sourceId)?.currency}
                categoryName={categories.find((c) => c.id === tx.categoryId)?.name || null}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
