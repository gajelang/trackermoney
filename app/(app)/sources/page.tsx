"use client"

import type React from "react"

import { useEffect, useState } from "react"
import {
  getMoneySourcesByUser,
  createMoneySource,
  getMoneySourceBalance,
  getTransactionsBySource,
} from "@/lib/store"
import { MoneySourceCard } from "@/components/money-source-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useUser } from "@/components/user-provider"

export default function SourcesPage() {
  const { userId } = useUser()
  const [sources, setSources] = useState([])
  const [sourceStats, setSourceStats] = useState<Record<string, { balance: number; count: number }>>({})
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [ownerType, setOwnerType] = useState<"personal" | "company">("personal")
  const [currency, setCurrency] = useState("IDR")
  const [initialAmount, setInitialAmount] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    let active = true
    async function load() {
      setLoading(true)
      const moneySources = await getMoneySourcesByUser(userId)
      const balances = await Promise.all(moneySources.map((s) => getMoneySourceBalance(s.id)))
      const counts = await Promise.all(moneySources.map(async (s) => (await getTransactionsBySource(s.id)).length))
      if (!active) return
      setSources(moneySources)
      setSourceStats(
        moneySources.reduce(
          (acc, source, index) => {
            acc[source.id] = { balance: balances[index], count: counts[index] }
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

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name || !initialAmount) {
      setError("Please fill in all fields")
      return
    }

    try {
      const amount = Math.floor(Number.parseFloat(initialAmount))
      if (amount < 0) throw new Error("Amount cannot be negative")

      await createMoneySource(userId, name, ownerType, currency, amount)
      const moneySources = await getMoneySourcesByUser(userId)
      const balances = await Promise.all(moneySources.map((s) => getMoneySourceBalance(s.id)))
      const counts = await Promise.all(moneySources.map(async (s) => (await getTransactionsBySource(s.id)).length))
      setSources(moneySources)
      setSourceStats(
        moneySources.reduce(
          (acc, source, index) => {
            acc[source.id] = { balance: balances[index], count: counts[index] }
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sources.map((source) => (
            <Link key={source.id} href={`/sources/${source.id}`}>
              <MoneySourceCard
                source={source}
                currentBalance={sourceStats[source.id]?.balance ?? 0}
                transactionCount={sourceStats[source.id]?.count ?? 0}
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
                  type="number"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(e.target.value)}
                  placeholder="0"
                  step="1"
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
    </div>
  )
}
