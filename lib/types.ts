export type OwnerType = "personal" | "company"
export type TransactionKind = "income" | "expense" | "transfer" | "adjustment"
export type CategoryKind = "income" | "expense"

export interface User {
  id: string
  email: string
  passwordHash: string
  createdAt: number
}

export interface MoneySource {
  id: string
  userId: string
  name: string
  ownerType: OwnerType
  currency: string
  initialAmount: number // integer in smallest unit
  createdAt: number
}

export interface Category {
  id: string
  userId: string
  name: string
  kind: CategoryKind
  createdAt: number
}

export interface TransferGroup {
  id: string
  userId: string
  createdAt: number
}

export interface Transaction {
  id: string
  userId: string
  sourceId: string
  categoryId?: string
  transferGroupId?: string
  kind: TransactionKind
  amountSigned: number // positive for income/transfer-in, negative for expense/transfer-out
  occurredAt: number // timestamp
  note?: string
  createdAt: number
}

export interface MoneySourceWithBalance extends MoneySource {
  currentBalance: number
  transactionCount: number
}
