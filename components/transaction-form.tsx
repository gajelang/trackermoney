"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getMoneySourcesByUser, getCategoriesByUser, createTransaction, createDefaultCategories } from "@/lib/store"
import type { Category, MoneySource } from "@/lib/types"
import { formatRupiahInput, parseRupiahInput } from "@/lib/format"

interface TransactionFormProps {
  userId: string
  onSuccess?: () => void
}

export function TransactionForm({ userId, onSuccess }: TransactionFormProps) {
  const [kind, setKind] = useState<"income" | "expense">("expense")
  const [sourceId, setSourceId] = useState<string>("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [amount, setAmount] = useState<string>("")
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [note, setNote] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [sources, setSources] = useState<MoneySource[]>([])
  const [categories, setCategories] = useState<Category[]>([])

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
    let active = true
    async function loadCategories() {
      let data = await getCategoriesByUser(userId)
      if (data.length === 0) {
        await createDefaultCategories(userId)
        data = await getCategoriesByUser(userId)
      }
      if (active) {
        setCategories(data.filter((c) => c.kind === kind))
      }
    }
    loadCategories()
    return () => {
      active = false
    }
  }, [userId, kind])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!sourceId || !amount) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)

    try {
      const numAmount = parseRupiahInput(amount)
      if (numAmount <= 0) {
        throw new Error("Amount must be greater than 0")
      }

      const occurredAt = new Date(date).getTime()
      await createTransaction(userId, sourceId, kind, numAmount, categoryId || undefined, occurredAt, note || undefined)

      setAmount("")
      setNote("")
      setDate(new Date().toISOString().split("T")[0])
      setCategoryId("")

      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create transaction")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{kind === "income" ? "Add Income" : "Add Expense"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded">
              {error}
            </div>
          )}

          {/* Kind Selection */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setKind("income")}
              className={`p-3 rounded border-2 transition ${
                kind === "income" ? "border-primary bg-primary/10 text-primary" : "border-border"
              }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => setKind("expense")}
              className={`p-3 rounded border-2 transition ${
                kind === "expense" ? "border-primary bg-primary/10 text-primary" : "border-border"
              }`}
            >
              Expense
            </button>
          </div>

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

          {/* Category Selection */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">
              Category {!categoryId && "(Optional)"}
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
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
            {loading ? "Creating..." : "Create Transaction"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
