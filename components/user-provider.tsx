"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { initializeUser } from "@/lib/store"

interface UserContextValue {
  userId: string | null
  loading: boolean
}

const UserContext = createContext<UserContextValue>({ userId: null, loading: true })

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    initializeUser()
      .then((id) => {
        if (active) setUserId(id)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const value = useMemo(() => ({ userId, loading }), [userId, loading])

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  return useContext(UserContext)
}
