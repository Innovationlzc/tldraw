import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'



export function useCurrentUserId() {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (data?.user) {
        setUserId(data.user.id)
      } else {
        console.warn('Not logged in or failed to fetch user:', error?.message)
      }
    }

    fetchUser()
  }, [])

  return userId
}

export function useSupabaseUser() {
  const [user, setUser] = useState<null | { id: string }>(null)

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    // Get initial session
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  return user
}
