"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getMoneySourcesByUser, createTransfer } from "@/lib/store"
import type { MoneySource } from "@/lib/types"
import { formatRupiahInput, parseRupiahInput } from "@/lib/format"

interface TransferFormProps {
  userId: string
  onSuccess?: () => void
}

export function TransferForm({ userId, onSuccess }: TransferFormProps) {
  const [fromSourceId, setFromSourceId] = useState<string>("")
  const [toSourceId, setToSourceId] = useState<string>("")
  const [amount, setAmount] = useState<string>("")
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [note, setNote] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [sources, setSources] = useState<MoneySource[]>([])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!fromSourceId || !toSourceId || !amount) {
      setError("Please fill in all required fields")
      return
    }

    if (fromSourceId === toSourceId) {
      setError("Cannot transfer to the same source")
      return
    }

    setLoading(true)

    try {
      const numAmount = parseRupiahInput(amount)
      if (numAmount <= 0) {
        throw new Error("Amount must be greater than 0")
      }

      const occurredAt = new Date(date).getTime()
      await createTransfer(userId, fromSourceId, toSourceId, numAmount, occurredAt, note || undefined)

      setAmount("")
      setNote("")
      setDate(new Date().toISOString().split("T")[0])
      setFromSourceId("")
      setToSourceId("")

      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create transfer")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transfer Money</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">Move money from one source to another</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded">
              {error}
            </div>
          )}

          {/* From Source */}
          <div>
            <label htmlFor="from" className="block text-sm font-medium mb-1">
              From *
            </label>
            <select
              id="from"
              value={fromSourceId}
              onChange={(e) => setFromSourceId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
              required
            >
              <option value="">Select source</option>
              {sources.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.currency})
                </option>
              ))}
            </select>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="text-2xl">↓</div>
          </div>

          {/* To Source */}
          <div>
            <label htmlFor="to" className="block text-sm font-medium mb-1">
              To *
            </label>
            <select
              id="to"
              value={toSourceId}
              onChange={(e) => setToSourceId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
              required
            >
              <option value="">Select source</option>
              {sources.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.currency})
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium mb-1">
              Amount *
            </label>
            <Input
              type="text"
              id="amount"
              inputMode="numeric"
              value={formatRupiahInput(amount)}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
              placeholder="Rp 0"
              required
            />
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-1">
              Date *
            </label>
            <Input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          {/* Note */}
          <div>
            <label htmlFor="note" className="block text-sm font-medium mb-1">
              Note (Optional)
            </label>
            <Input
              type="text"
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Processing..." : "Create Transfer"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
