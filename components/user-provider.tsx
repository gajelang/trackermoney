"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { initializeUser } from "@/lib/store"

interface UserContextValue {
  userId: string | null
  loading: boolean
  error: string | null
}

const UserContext = createContext<UserContextValue>({ userId: null, loading: true, error: null })

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    initializeUser()
      .then((id) => {
        if (active) setUserId(id)
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to initialize user")
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const value = useMemo(() => ({ userId, loading, error }), [userId, loading, error])

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  return useContext(UserContext)
}
