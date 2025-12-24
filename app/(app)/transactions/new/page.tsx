"use client"

import { useRouter } from "next/navigation"
import { TransactionForm } from "@/components/transaction-form"
import { useUser } from "@/components/user-provider"

export default function NewTransactionPage() {
  const router = useRouter()
  const { userId } = useUser()

  if (!userId) return null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Transaction</h1>
        <p className="text-muted-foreground mt-2">Record income or expense</p>
      </div>

      <TransactionForm userId={userId} onSuccess={() => router.push("/transactions")} />
    </div>
  )
}
