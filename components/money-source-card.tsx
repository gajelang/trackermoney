"use client"

import { formatCurrency } from "@/lib/format"
import { Pencil } from "lucide-react"
import { normalizeSourceColor, sourceGradientClasses } from "@/lib/source-theme"
import type { MoneySource } from "@/lib/types"

interface MoneySourceCardProps {
  source: MoneySource
  currentBalance: number
  transactionCount: number
  onClick?: () => void
  onEdit?: () => void
}

export function MoneySourceCard({ source, currentBalance, transactionCount, onClick, onEdit }: MoneySourceCardProps) {
  const normalizedColor = normalizeSourceColor(source.color)
  const isHexColor = /^#([0-9a-fA-F]{6})$/.test(normalizedColor)
  const gradientClass =
    sourceGradientClasses[(source.color as keyof typeof sourceGradientClasses) || "blue"] || sourceGradientClasses.blue
  const cardStyle = isHexColor
    ? {
        backgroundImage: `linear-gradient(135deg, ${normalizedColor}3d 0%, rgba(15, 23, 42, 0) 55%, rgba(15, 23, 42, 0.85) 100%)`,
        borderColor: `${normalizedColor}55`,
      }
    : undefined
  return (
    <div
      onClick={onClick}
      style={cardStyle}
      className={`bg-gradient-to-br ${
        isHexColor ? `border` : gradientClass
      } rounded-3xl p-6 cursor-pointer hover:shadow-lg transition-all`}
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
