"use client"

import { useRouter } from "next/navigation"
import { AdjustmentForm } from "@/components/adjustment-form"
import { useUser } from "@/components/user-provider"

export default function NewAdjustmentPage() {
  const router = useRouter()
  const { userId } = useUser()

  if (!userId) return null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Balance Adjustment</h1>
        <p className="text-muted-foreground mt-2">Correct the balance when actual amount differs from calculated</p>
      </div>

      <AdjustmentForm userId={userId} onSuccess={() => router.push("/transactions")} />
    </div>
  )
}
