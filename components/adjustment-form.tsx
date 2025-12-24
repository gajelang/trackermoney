"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getMoneySourcesByUser, createAdjustment, getMoneySourceBalance } from "@/lib/store"
import { formatCurrency, formatRupiahInput, parseRupiahInput } from "@/lib/format"
import type { MoneySource } from "@/lib/types"

interface AdjustmentFormProps {
  userId: string
  onSuccess?: () => void
}

export function AdjustmentForm({ userId, onSuccess }: AdjustmentFormProps) {
  const [sourceId, setSourceId] = useState<string>("")
  const [actualBalance, setActualBalance] = useState<string>("")
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [includeInCashflow, setIncludeInCashflow] = useState(false)
  const [sources, setSources] = useState<MoneySource[]>([])
  const [systemBalance, setSystemBalance] = useState(0)

  const selectedSource = sources.find((s) => s.id === sourceId)
  const delta = actualBalance ? parseRupiahInput(actualBalance) - systemBalance : 0

  useEffect(() => {
    let active = true
    async function loadSources() {
      const data = await getMoneySourcesByUser(userId)
      if (active) setSources(data)
    }
    loadSources()
    return () => {
      active = false
    }
  }, [userId])

  useEffect(() => {
    if (!sourceId) {
      setSystemBalance(0)
      return
    }
    let active = true
    async function loadBalance() {
      const balance = await getMoneySourceBalance(sourceId)
      if (active) setSystemBalance(balance)
    }
    loadBalance()
    return () => {
      active = false
    }
  }, [sourceId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!sourceId || !actualBalance) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)

    try {
      const numBalance = parseRupiahInput(actualBalance)
      const occurredAt = new Date(date).getTime()
      await createAdjustment(userId, sourceId, numBalance, occurredAt, includeInCashflow)

      setActualBalance("")
      setDate(new Date().toISOString().split("T")[0])
      setSourceId("")
      setIncludeInCashflow(false)

      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create adjustment")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance Adjustment</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Correct the balance when actual amount differs from calculated balance
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded">
              {error}
            </div>
          )}

          {/* Source Selection */}
          <div>
            <label htmlFor="source" className="block text-sm font-medium mb-1">
              Money Source *
            </label>
            <select
              id="source"
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
              required
            >
              <option value="">Select a source</option>
              {sources.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.currency})
                </option>
              ))}
            </select>
          </div>

          {/* Current System Balance Display */}
          {selectedSource && (
            <div className="bg-muted/50 p-3 rounded-md">
              <div className="text-sm text-muted-foreground mb-1">System Balance (Calculated)</div>
              <div className="text-xl font-semibold">{formatCurrency(systemBalance, selectedSource.currency)}</div>
            </div>
          )}

          {/* Actual Balance Input */}
          <div>
            <label htmlFor="actual" className="block text-sm font-medium mb-1">
              Actual Balance *
            </label>
            <Input
              type="text"
              id="actual"
              inputMode="numeric"
              value={formatRupiahInput(actualBalance)}
              onChange={(e) => setActualBalance(e.target.value.replace(/\D/g, ""))}
              placeholder="Rp 0"
              required
            />
          </div>

          {/* Delta Display */}
          {selectedSource && actualBalance && (
            <div
              className={`p-3 rounded-md ${
                delta === 0 ? "bg-green-50 border border-green-200" : delta > 0 ? "bg-green-50" : "bg-red-50"
              }`}
            >
              <div className="text-sm text-muted-foreground">Difference (Adjustment Amount)</div>
              <div className={`text-lg font-semibold ${delta >= 0 ? "text-green-600" : "text-red-600"}`}>
                {delta >= 0 ? "+" : ""}
                {formatCurrency(delta, selectedSource.currency)}
              </div>
            </div>
          )}

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-1">
              Adjustment Date *
            </label>
            <Input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={includeInCashflow}
              onChange={(e) => setIncludeInCashflow(e.target.checked)}
              className="h-4 w-4"
            />
            Count this adjustment in income/expense
          </label>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Processing..." : "Create Adjustment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
