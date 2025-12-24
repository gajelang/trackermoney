"use client"

import { formatCurrency, formatDateTime } from "@/lib/format"
import type { Transaction } from "@/lib/types"

interface TransactionRowProps {
  transaction: Transaction
  categoryName?: string | null
  sourceName?: string | null
  currency?: string | null
}

export function TransactionRow({ transaction, categoryName, sourceName, currency }: TransactionRowProps) {
  const isSend = transaction.amountSigned < 0
  const absAmount = Math.abs(transaction.amountSigned)

  let label = ""
  let colorClass = ""
  let icon = ""

  if (transaction.kind === "income") {
    label = categoryName || "Income"
    colorClass = "text-green-600"
    icon = "+"
  } else if (transaction.kind === "expense") {
    label = categoryName || "Expense"
    colorClass = "text-red-600"
    icon = "ƒ^'"
  } else if (transaction.kind === "transfer") {
    label = isSend ? "Transfer Out" : "Transfer In"
    colorClass = isSend ? "text-blue-600" : "text-blue-500"
    icon = isSend ? "ƒ+'" : "ƒ+?"
  } else if (transaction.kind === "adjustment") {
    label = "Adjustment"
    colorClass = transaction.amountSigned >= 0 ? "text-amber-600" : "text-amber-600"
    icon = "ƒsT"
  }

  return (
    <div className="flex items-center justify-between p-4 border-b hover:bg-muted/30 transition">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div className={`text-lg ${colorClass}`}>{icon}</div>
          <div>
            <div className="font-medium">{label}</div>
            <div className="text-xs text-muted-foreground">{formatDateTime(transaction.occurredAt)}</div>
            {transaction.note && <div className="text-sm text-muted-foreground mt-1">{transaction.note}</div>}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className={`font-semibold ${colorClass}`}>
          {transaction.amountSigned >= 0 ? "+" : ""}
          {formatCurrency(absAmount, currency || "IDR")}
        </div>
        <div className="text-xs text-muted-foreground">{sourceName}</div>
      </div>
    </div>
  )
}
