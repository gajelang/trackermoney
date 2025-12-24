"use client"

import type React from "react"

import { useEffect, useState } from "react"
import {
  getMoneySourcesByUser,
  createMoneySource,
  computeSourceStats,
  getTransactionsByUser,
  createAdjustment,
} from "@/lib/store"
import { MoneySourceCard } from "@/components/money-source-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useUser } from "@/components/user-provider"
import { formatRupiahInput, parseRupiahInput } from "@/lib/format"
import type { MoneySource } from "@/lib/types"

export default function SourcesPage() {
  const { userId } = useUser()
  const [sources, setSources] = useState<MoneySource[]>([])
  const [sourceStats, setSourceStats] = useState<Record<string, { balance: number; count: number }>>({})
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [ownerType, setOwnerType] = useState<"personal" | "company">("personal")
  const [currency, setCurrency] = useState("IDR")
  const [initialAmount, setInitialAmount] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [includeInCashflow, setIncludeInCashflow] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState("")

  useEffect(() => {
    if (!userId) return
    const activeUserId = userId
    let active = true
    async function load() {
      setLoading(true)
      const [moneySources, transactions] = await Promise.all([
        getMoneySourcesByUser(activeUserId),
        getTransactionsByUser(activeUserId),
      ])
      const stats = computeSourceStats(moneySources, transactions)
      if (!active) return
      setSources(moneySources)
      setSourceStats(
        moneySources.reduce(
          (acc, source) => {
            acc[source.id] = { balance: stats[source.id]?.balance ?? source.initialAmount, count: stats[source.id]?.count ?? 0 }
            return acc
          },
          {} as Record<string, { balance: number; count: number }>,
        ),
      )
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [userId])

  if (!userId || loading) return null

  const openEditModal = (sourceId: string) => {
    const currentBalance = sourceStats[sourceId]?.balance ?? 0
    setEditingSourceId(sourceId)
    setEditValue(String(currentBalance))
    setIncludeInCashflow(false)
    setEditError("")
  }

  const closeEditModal = () => {
    setEditingSourceId(null)
    setEditValue("")
    setIncludeInCashflow(false)
    setEditError("")
  }

  const handleSaveEdit = async () => {
    if (!editingSourceId) return
    if (!userId) return
    const activeUserId = userId
    setEditError("")
    setSavingEdit(true)
    try {
      const targetBalance = parseRupiahInput(editValue)
      if (Number.isNaN(targetBalance)) {
        throw new Error("Please enter a valid number")
      }
      await createAdjustment(activeUserId, editingSourceId, targetBalance, Date.now(), includeInCashflow)
      const [moneySources, transactions] = await Promise.all([
        getMoneySourcesByUser(activeUserId),
        getTransactionsByUser(activeUserId),
      ])
      const stats = computeSourceStats(moneySources, transactions)
      setSources(moneySources)
      setSourceStats(
        moneySources.reduce(
          (acc, source) => {
            acc[source.id] = { balance: stats[source.id]?.balance ?? source.initialAmount, count: stats[source.id]?.count ?? 0 }
            return acc
          },
          {} as Record<string, { balance: number; count: number }>,
        ),
      )
      closeEditModal()
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to save balance")
    } finally {
      setSavingEdit(false)
    }
  }

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!userId) return
    const activeUserId = userId

    if (!name || !initialAmount) {
      setError("Please fill in all fields")
      return
    }

    try {
      const amount = parseRupiahInput(initialAmount)
      if (amount < 0) throw new Error("Amount cannot be negative")

      await createMoneySource(activeUserId, name, ownerType, currency, amount)
      const [moneySources, transactions] = await Promise.all([
        getMoneySourcesByUser(activeUserId),
        getTransactionsByUser(activeUserId),
      ])
      const stats = computeSourceStats(moneySources, transactions)
      setSources(moneySources)
      setSourceStats(
        moneySources.reduce(
          (acc, source) => {
            acc[source.id] = { balance: stats[source.id]?.balance ?? source.initialAmount, count: stats[source.id]?.count ?? 0 }
            return acc
          },
          {} as Record<string, { balance: number; count: number }>,
        ),
      )

      setName("")
      setInitialAmount("")
      setOwnerType("personal")
      setCurrency("IDR")
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create source")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Money Sources</h1>
        <p className="text-muted-foreground mt-2">Manage your personal and company accounts</p>
      </div>

      {sources.length > 0 && (
        <div className="grid gap-4">
          {sources.map((source) => (
            <Link key={source.id} href={`/sources/${source.id}`}>
              <MoneySourceCard
                source={source}
                currentBalance={sourceStats[source.id]?.balance ?? 0}
                transactionCount={sourceStats[source.id]?.count ?? 0}
                onEdit={() => openEditModal(source.id)}
              />
            </Link>
          ))}
        </div>
      )}

      {!showForm && (
        <Button onClick={() => setShowForm(true)} variant="outline" className="w-full">
          + Add Money Source
        </Button>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Money Source</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddSource} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Cash, Bank Account"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={ownerType}
                    onChange={(e) => setOwnerType(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="personal">Personal</option>
                    <option value="company">Company</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Currency</label>
                  <Input value={currency} onChange={(e) => setCurrency(e.target.value)} maxLength={3} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Initial Balance</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={formatRupiahInput(initialAmount)}
                  onChange={(e) => setInitialAmount(e.target.value.replace(/\D/g, ""))}
                  placeholder="Rp 0"
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Add Source
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {editingSourceId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Set Account Balance</h2>
                <p className="text-sm text-muted-foreground">Update the current balance for this account.</p>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {editError && (
              <div className="mt-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded">
                {editError}
              </div>
            )}

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Balance</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={formatRupiahInput(editValue)}
                  onChange={(e) => setEditValue(e.target.value.replace(/\D/g, ""))}
                  placeholder="Rp 0"
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={includeInCashflow}
                  onChange={(e) => setIncludeInCashflow(e.target.checked)}
                  className="h-4 w-4"
                />
                Count this change in income/expense
              </label>
            </div>

            <div className="mt-6 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={closeEditModal}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSaveEdit} disabled={savingEdit}>
                {savingEdit ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
