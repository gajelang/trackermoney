"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createMoneySource, getMoneySourcesByUser } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useUser } from "@/components/user-provider"

export default function SetupSourcesPage() {
  const router = useRouter()
  const { userId } = useUser()
  const [sources, setSources] = useState([])
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
      if (!active) return
      setSources(moneySources)
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
      setSources(await getMoneySourcesByUser(userId))

      setName("")
      setInitialAmount("")
      setOwnerType("personal")
      setCurrency("IDR")
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create source")
    }
  }

  const canProceed =
    sources.length >= 2 &&
    sources.some((s) => s.ownerType === "personal") &&
    sources.some((s) => s.ownerType === "company")

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Set Up Money Sources</h1>
        <p className="text-muted-foreground mt-2">Create at least one personal and one company source to get started</p>
      </div>

      {/* Sources List */}
      <div className="space-y-2">
        {sources.map((source) => (
          <div key={source.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
            <div>
              <div className="font-medium">{source.name}</div>
              <div className="text-sm text-muted-foreground">
                {source.ownerType === "personal" ? "Personal" : "Company"} • {source.currency}
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{source.initialAmount.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Initial balance</div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Source Form */}
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

      {/* Navigation */}
      <div className="flex gap-4 justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
        <Link href="/dashboard">
          <Button disabled={!canProceed} className="min-w-32">
            {canProceed ? "Start Using" : "Need 1 Personal + 1 Company"}
          </Button>
        </Link>
      </div>
    </div>
  )
}
