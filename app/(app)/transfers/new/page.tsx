"use client"

import { useRouter } from "next/navigation"
import { TransferForm } from "@/components/transfer-form"
import { useUser } from "@/components/user-provider"

export default function NewTransferPage() {
  const router = useRouter()
  const { userId } = useUser()

  if (!userId) return null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transfer Money</h1>
        <p className="text-muted-foreground mt-2">Move money between sources</p>
      </div>

      <TransferForm userId={userId} onSuccess={() => router.push("/transactions")} />
    </div>
  )
}
