import type { User, MoneySource, Category, Transaction, TransferGroup } from "./types"
import { supabase } from "./supabase"

const LOCAL_USER_KEY = "money-tracker-user-id"

const toNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) return 0
  return typeof value === "number" ? value : Number(value)
}

type UserRow = {
  id: string
  email: string | null
  created_at: number | string
}

type MoneySourceRow = {
  id: string
  user_id: string
  name: string
  owner_type: "personal" | "company"
  currency: string
  color: string | null
  initial_amount: number | string
  created_at: number | string
}

type CategoryRow = {
  id: string
  user_id: string
  name: string
  kind: "income" | "expense"
  created_at: number | string
}

type TransferGroupRow = {
  id: string
  user_id: string
  created_at: number | string
}

type TransactionRow = {
  id: string
  user_id: string
  source_id: string
  category_id: string | null
  transfer_group_id: string | null
  kind: "income" | "expense" | "transfer" | "adjustment"
  amount_signed: number | string
  occurred_at: number | string
  note: string | null
  include_in_cashflow: boolean | null
  created_at: number | string
}


function mapUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email || "",
    passwordHash: "",
    createdAt: toNumber(row.created_at),
  }
}

function mapMoneySource(row: MoneySourceRow): MoneySource {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    ownerType: row.owner_type,
    currency: row.currency,
    color: row.color || "blue",
    initialAmount: toNumber(row.initial_amount),
    createdAt: toNumber(row.created_at),
  }
}

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    kind: row.kind,
    createdAt: toNumber(row.created_at),
  }
}

function mapTransferGroup(row: TransferGroupRow): TransferGroup {
  return {
    id: row.id,
    userId: row.user_id,
    createdAt: toNumber(row.created_at),
  }
}

function mapTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    userId: row.user_id,
    sourceId: row.source_id,
    categoryId: row.category_id || undefined,
    transferGroupId: row.transfer_group_id || undefined,
    kind: row.kind,
    amountSigned: toNumber(row.amount_signed),
    occurredAt: toNumber(row.occurred_at),
    note: row.note || undefined,
    includeInCashflow: row.include_in_cashflow ?? true,
    createdAt: toNumber(row.created_at),
  }
}


export async function initializeUser(): Promise<string | null> {
  if (typeof window === "undefined") return null

  let userId = localStorage.getItem(LOCAL_USER_KEY)
  if (!userId) {
    userId = crypto.randomUUID()
    localStorage.setItem(LOCAL_USER_KEY, userId)
  }

  const { error } = await supabase
    .from("users")
    .upsert({ id: userId, created_at: Date.now() }, { onConflict: "id" })
  if (error) {
    throw new Error("Failed to initialize user")
  }

  return userId
}

export async function getUserById(userId: string): Promise<User | null> {
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).maybeSingle()
  if (error || !data) return null
  return mapUser(data as UserRow)
}

export async function createMoneySource(
  userId: string,
  name: string,
  ownerType: "personal" | "company",
  currency: string,
  initialAmount: number,
  color = "blue",
): Promise<MoneySource> {
  const source: MoneySource = {
    id: crypto.randomUUID(),
    userId,
    name,
    ownerType,
    currency,
    color,
    initialAmount,
    createdAt: Date.now(),
  }

  const { error } = await supabase.from("money_sources").insert({
    id: source.id,
    user_id: source.userId,
    name: source.name,
    owner_type: source.ownerType,
    currency: source.currency,
    color: source.color,
    initial_amount: source.initialAmount,
    created_at: source.createdAt,
  })
  if (error) throw error

  return source
}

export async function getMoneySourcesByUser(userId: string): Promise<MoneySource[]> {
  const { data, error } = await supabase.from("money_sources").select("*").eq("user_id", userId).order("created_at")
  if (error || !data) return []
  return data.map((row) => mapMoneySource(row as MoneySourceRow))
}

export async function getMoneySource(sourceId: string): Promise<MoneySource | null> {
  const { data, error } = await supabase.from("money_sources").select("*").eq("id", sourceId).maybeSingle()
  if (error || !data) return null
  return mapMoneySource(data as MoneySourceRow)
}

export async function updateMoneySource(sourceId: string, updates: Partial<MoneySource>) {
  const mapped: Record<string, unknown> = {}
  if (updates.name !== undefined) mapped.name = updates.name
  if (updates.ownerType !== undefined) mapped.owner_type = updates.ownerType
  if (updates.currency !== undefined) mapped.currency = updates.currency
  if (updates.color !== undefined) mapped.color = updates.color
  if (updates.initialAmount !== undefined) mapped.initial_amount = updates.initialAmount

  if (Object.keys(mapped).length === 0) return
  const { error } = await supabase.from("money_sources").update(mapped).eq("id", sourceId)
  if (error) throw error
}

export async function createCategory(userId: string, name: string, kind: "income" | "expense"): Promise<Category> {
  const category: Category = {
    id: crypto.randomUUID(),
    userId,
    name,
    kind,
    createdAt: Date.now(),
  }
  const { error } = await supabase.from("categories").insert({
    id: category.id,
    user_id: category.userId,
    name: category.name,
    kind: category.kind,
    created_at: category.createdAt,
  })
  if (error) throw error
  return category
}

export async function getCategoriesByUser(userId: string): Promise<Category[]> {
  const { data, error } = await supabase.from("categories").select("*").eq("user_id", userId).order("name")
  if (error || !data) return []
  return data.map((row) => mapCategory(row as CategoryRow))
}

export async function createDefaultCategories(userId: string): Promise<Category[]> {
  const existing = await getCategoriesByUser(userId)
  if (existing.length > 0) return existing

  const createdAt = Date.now()
  const defaults = [
    { name: "Food", kind: "expense" as const },
    { name: "Transport", kind: "expense" as const },
    { name: "Utilities", kind: "expense" as const },
    { name: "Salary", kind: "income" as const },
    { name: "Revenue", kind: "income" as const },
  ]
  const rows = defaults.map((cat) => ({
    id: crypto.randomUUID(),
    user_id: userId,
    name: cat.name,
    kind: cat.kind,
    created_at: createdAt,
  }))

  const { error } = await supabase.from("categories").upsert(rows, { onConflict: "user_id,name,kind" })
  if (error) throw error

  return getCategoriesByUser(userId)
}

export async function createTransaction(
  userId: string,
  sourceId: string,
  kind: "income" | "expense",
  amount: number,
  categoryId: string | undefined,
  occurredAt: number,
  note?: string,
): Promise<Transaction> {
  const amountSigned = kind === "income" ? Math.abs(amount) : -Math.abs(amount)
  const transaction: Transaction = {
    id: crypto.randomUUID(),
    userId,
    sourceId,
    categoryId,
    kind,
    amountSigned,
    occurredAt,
    note,
    includeInCashflow: true,
    createdAt: Date.now(),
  }

  const { error } = await supabase.from("transactions").insert({
    id: transaction.id,
    user_id: transaction.userId,
    source_id: transaction.sourceId,
    category_id: transaction.categoryId || null,
    transfer_group_id: transaction.transferGroupId || null,
    kind: transaction.kind,
    amount_signed: transaction.amountSigned,
    occurred_at: transaction.occurredAt,
    note: transaction.note || null,
    include_in_cashflow: transaction.includeInCashflow,
    created_at: transaction.createdAt,
  })
  if (error) throw error

  return transaction
}

export async function createTransfer(
  userId: string,
  fromSourceId: string,
  toSourceId: string,
  amount: number,
  occurredAt: number,
  note?: string,
): Promise<{ outTx: Transaction; inTx: Transaction; group: TransferGroup }> {
  const group: TransferGroup = {
    id: crypto.randomUUID(),
    userId,
    createdAt: Date.now(),
  }

  const { error: groupError } = await supabase.from("transfer_groups").insert({
    id: group.id,
    user_id: group.userId,
    created_at: group.createdAt,
  })
  if (groupError) throw groupError

  const outTx: Transaction = {
    id: crypto.randomUUID(),
    userId,
    sourceId: fromSourceId,
    kind: "transfer",
    amountSigned: -Math.abs(amount),
    transferGroupId: group.id,
    occurredAt,
    note,
    includeInCashflow: true,
    createdAt: Date.now(),
  }

  const inTx: Transaction = {
    id: crypto.randomUUID(),
    userId,
    sourceId: toSourceId,
    kind: "transfer",
    amountSigned: Math.abs(amount),
    transferGroupId: group.id,
    occurredAt,
    note,
    includeInCashflow: true,
    createdAt: Date.now(),
  }

  const { error: txError } = await supabase.from("transactions").insert([
    {
      id: outTx.id,
      user_id: outTx.userId,
      source_id: outTx.sourceId,
      category_id: null,
      transfer_group_id: outTx.transferGroupId,
      kind: outTx.kind,
      amount_signed: outTx.amountSigned,
      occurred_at: outTx.occurredAt,
      note: outTx.note || null,
      include_in_cashflow: outTx.includeInCashflow,
      created_at: outTx.createdAt,
    },
    {
      id: inTx.id,
      user_id: inTx.userId,
      source_id: inTx.sourceId,
      category_id: null,
      transfer_group_id: inTx.transferGroupId,
      kind: inTx.kind,
      amount_signed: inTx.amountSigned,
      occurred_at: inTx.occurredAt,
      note: inTx.note || null,
      include_in_cashflow: inTx.includeInCashflow,
      created_at: inTx.createdAt,
    },
  ])
  if (txError) throw txError

  return { outTx, inTx, group }
}

export async function createAdjustment(
  userId: string,
  sourceId: string,
  actualBalance: number,
  occurredAt: number,
  includeInCashflow = false,
): Promise<Transaction> {
  const currentBalance = await getMoneySourceBalance(sourceId)
  const delta = actualBalance - currentBalance

  const transaction: Transaction = {
    id: crypto.randomUUID(),
    userId,
    sourceId,
    kind: "adjustment",
    amountSigned: delta,
    occurredAt,
    includeInCashflow,
    createdAt: Date.now(),
  }

  const { error } = await supabase.from("transactions").insert({
    id: transaction.id,
    user_id: transaction.userId,
    source_id: transaction.sourceId,
    category_id: null,
    transfer_group_id: null,
    kind: transaction.kind,
    amount_signed: transaction.amountSigned,
    occurred_at: transaction.occurredAt,
    note: null,
    include_in_cashflow: transaction.includeInCashflow,
    created_at: transaction.createdAt,
  })
  if (error) throw error

  return transaction
}

export async function getTransactionsBySource(sourceId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("source_id", sourceId)
    .order("occurred_at", { ascending: false })
  if (error || !data) return []
  return data.map((row) => mapTransaction(row as TransactionRow))
}

export async function getTransactionsByUser(userId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("occurred_at", { ascending: false })
  if (error || !data) return []
  return data.map((row) => mapTransaction(row as TransactionRow))
}

export function computeSourceStats(sources: MoneySource[], transactions: Transaction[]) {
  const stats: Record<string, { balance: number; count: number }> = {}
  for (const source of sources) {
    stats[source.id] = { balance: source.initialAmount, count: 0 }
  }
  for (const tx of transactions) {
    const entry = stats[tx.sourceId]
    if (!entry) continue
    entry.balance += tx.amountSigned
    entry.count += 1
  }
  return stats
}

export function calculateDashboardTotalsFromData(sources: MoneySource[], transactions: Transaction[]) {
  const stats = computeSourceStats(sources, transactions)
  const totalBalance = sources.reduce((acc, s) => acc + (stats[s.id]?.balance ?? 0), 0)
  const personalBalance = sources
    .filter((s) => s.ownerType === "personal")
    .reduce((acc, s) => acc + (stats[s.id]?.balance ?? 0), 0)
  const companyBalance = sources
    .filter((s) => s.ownerType === "company")
    .reduce((acc, s) => acc + (stats[s.id]?.balance ?? 0), 0)

  const thisMonth = new Date()
  thisMonth.setDate(1)
  thisMonth.setHours(0, 0, 0, 0)
  const thisMonthTime = thisMonth.getTime()

  const monthTransactions = transactions.filter((t) => t.occurredAt >= thisMonthTime)
  const monthIncome = monthTransactions
    .filter(
      (t) =>
        t.includeInCashflow !== false &&
        (t.kind === "income" || (t.kind === "transfer" && t.amountSigned > 0) || (t.kind === "adjustment" && t.amountSigned > 0)),
    )
    .reduce((acc, t) => acc + t.amountSigned, 0)
  const monthExpense = monthTransactions
    .filter(
      (t) =>
        t.includeInCashflow !== false &&
        (t.kind === "expense" || (t.kind === "transfer" && t.amountSigned < 0) || (t.kind === "adjustment" && t.amountSigned < 0)),
    )
    .reduce((acc, t) => acc - t.amountSigned, 0)

  return {
    totalBalance,
    personalBalance,
    companyBalance,
    monthIncome,
    monthExpense,
    monthNet: monthIncome - monthExpense,
  }
}

export async function getSourceStatsByUser(userId: string) {
  const [sources, transactions] = await Promise.all([getMoneySourcesByUser(userId), getTransactionsByUser(userId)])
  const stats = computeSourceStats(sources, transactions)
  return { sources, stats, transactions }
}

export async function getMoneySourceBalance(sourceId: string): Promise<number> {
  const source = await getMoneySource(sourceId)
  if (!source) return 0

  const { data, error } = await supabase.from("transactions").select("amount_signed").eq("source_id", sourceId)
  if (error || !data) return source.initialAmount

  const sum = data.reduce((acc, tx) => acc + toNumber((tx as { amount_signed: number | string }).amount_signed), 0)
  return source.initialAmount + sum
}

export async function getDashboardTotals(userId: string) {
  const [sources, transactions] = await Promise.all([getMoneySourcesByUser(userId), getTransactionsByUser(userId)])
  return calculateDashboardTotalsFromData(sources, transactions)
}
