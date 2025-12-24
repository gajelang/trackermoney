"use client"

import { formatCurrency } from "@/lib/format"
import { Pencil } from "lucide-react"
import type { MoneySource } from "@/lib/types"

interface MoneySourceCardProps {
  source: MoneySource
  currentBalance: number
  transactionCount: number
  onClick?: () => void
  onEdit?: () => void
}

export function MoneySourceCard({ source, currentBalance, transactionCount, onClick, onEdit }: MoneySourceCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-gradient-to-br from-primary/20 via-card to-card rounded-3xl p-6 cursor-pointer hover:shadow-lg hover:from-primary/30 transition-all border border-primary/20"
    >
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="text-sm text-muted-foreground font-medium">
            {source.ownerType === "personal" ? "Personal" : "Company"}
          </div>
          <div className="text-xl font-bold mt-1">{source.name}</div>
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                onEdit()
              }}
              className="text-muted-foreground hover:text-foreground"
              aria-label={`Edit ${source.name} balance`}
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          <div className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-full font-semibold">
            {source.currency}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="text-xs text-muted-foreground mb-2">Current Balance</div>
          <div className="text-3xl sm:text-4xl font-bold text-primary break-words">
            {formatCurrency(currentBalance, source.currency)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary/10">
          <div>
            <div className="text-xs text-muted-foreground">Initial</div>
            <div className="text-sm font-semibold mt-1">{formatCurrency(source.initialAmount, source.currency)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Transactions</div>
            <div className="text-sm font-semibold mt-1">{transactionCount}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
