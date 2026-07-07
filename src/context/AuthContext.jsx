import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load the existing session on mount and subscribe to auth changes.
  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session ?? null)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null)
    })

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  // Keep the current user's profile (name, reliability) in sync with the session.
  useEffect(() => {
    let active = true
    const userId = session?.user?.id
    if (!userId) {
      setProfile(null)
      return
    }
    // select('*') so the app keeps working whether or not the gamification
    // columns (xp, games_hosted, games_joined) have been added yet.
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        if (active) setProfile(data ?? null)
      })
    return () => {
      active = false
    }
  }, [session?.user?.id])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      signUp: (email, password, name) =>
        supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        }),
      signIn: (email, password) =>
        supabase.auth.signInWithPassword({ email, password }),
      // Redirects to Google, then back to /app where the session is detected.
      signInWithGoogle: () =>
        supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${window.location.origin}/app` },
        }),
      signOut: () => supabase.auth.signOut(),
      // Update the current user's profile row and reflect it locally. RLS
      // ensures a user can only update their own row.
      updateProfile: async (fields) => {
        const userId = session?.user?.id
        if (!userId) throw new Error('Not signed in')
        const { data, error } = await supabase
          .from('profiles')
          .update(fields)
          .eq('id', userId)
          .select('*')
          .single()
        if (error) throw error
        setProfile(data)
        return data
      },
    }),
    [session, profile, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
