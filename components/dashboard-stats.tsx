"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"

interface DashboardStatsProps {
  totalBalance: number
  personalBalance: number
  companyBalance: number
  monthIncome: number
  monthExpense: number
  monthNet: number
  currency?: string
}

export function DashboardStats({
  totalBalance,
  personalBalance,
  companyBalance,
  monthIncome,
  monthExpense,
  monthNet,
  currency = "IDR",
}: DashboardStatsProps) {
  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {/* Total Balance */}
      <Card className="xl:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">{formatCurrency(totalBalance, currency)}</div>
          <p className="text-xs text-muted-foreground mt-1">All sources combined</p>
        </CardContent>
      </Card>

      {/* Personal Balance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Personal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">{formatCurrency(personalBalance, currency)}</div>
        </CardContent>
      </Card>

      {/* Company Balance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Company</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">{formatCurrency(companyBalance, currency)}</div>
        </CardContent>
      </Card>

      {/* Month Net */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-xl sm:text-2xl font-bold ${monthNet >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(monthNet, currency)}
          </div>
        </CardContent>
      </Card>

      {/* Month Breakdown */}
      <Card className="sm:col-span-2 xl:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Month Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-xs sm:text-sm">
            <span>Income:</span>
            <span className="font-medium text-green-600">{formatCurrency(monthIncome, currency)}</span>
          </div>
          <div className="flex justify-between text-xs sm:text-sm">
            <span>Expense:</span>
            <span className="font-medium text-red-600">{formatCurrency(monthExpense, currency)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
