"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import type { Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { getLegacyUserId, migrateLegacyUserData, upsertAuthUser } from "@/lib/store"

interface UserContextValue {
  userId: string | null
  loading: boolean
  error: string | null
  authEmail: string | null
  migrationStatus: "idle" | "migrating" | "migrated" | "skipped" | "error"
  migrationMessage: string | null
  signOut: () => Promise<void>
}

const UserContext = createContext<UserContextValue>({
  userId: null,
  loading: true,
  error: null,
  authEmail: null,
  migrationStatus: "idle",
  migrationMessage: null,
  signOut: async () => {},
})

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [authEmail, setAuthEmail] = useState<string | null>(null)
  const [migrationStatus, setMigrationStatus] = useState<"idle" | "migrating" | "migrated" | "skipped" | "error">(
    "idle",
  )
  const [migrationMessage, setMigrationMessage] = useState<string | null>(null)

  const handleSession = async (session: Session | null, activeRef: { active: boolean }) => {
    if (!session?.user) {
      if (!activeRef.active) return
      setUserId(null)
      setAuthEmail(null)
      setMigrationStatus("idle")
      setMigrationMessage(null)
      setLoading(false)
      return
    }

    const authUserId = session.user.id
    const authUserEmail = session.user.email ?? null
    setAuthEmail(authUserEmail)
    setError(null)
    setLoading(true)

    try {
      await upsertAuthUser(authUserId, authUserEmail)
      if (!activeRef.active) return
      setUserId(authUserId)

      const legacyUserId = getLegacyUserId()
      if (legacyUserId && legacyUserId !== authUserId) {
        setMigrationStatus("migrating")
        const result = await migrateLegacyUserData(legacyUserId, authUserId)
        if (!activeRef.active) return
        setMigrationStatus(result.status)
        setMigrationMessage(result.message ?? null)
      } else {
        setMigrationStatus("idle")
        setMigrationMessage(null)
      }
    } catch (err) {
      if (!activeRef.active) return
      setError(err instanceof Error ? err.message : "Failed to initialize user")
    } finally {
      if (activeRef.active) setLoading(false)
    }
  }

  useEffect(() => {
    const activeRef = { active: true }
    supabase.auth.getSession().then(({ data }) => {
      if (!activeRef.active) return
      handleSession(data.session, activeRef)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!activeRef.active) return
      handleSession(session, activeRef)
    })

    return () => {
      activeRef.active = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = useMemo(
    () => ({ userId, loading, error, authEmail, migrationStatus, migrationMessage, signOut }),
    [userId, loading, error, authEmail, migrationStatus, migrationMessage],
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  return useContext(UserContext)
}
