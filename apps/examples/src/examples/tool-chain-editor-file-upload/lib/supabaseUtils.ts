import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import type { User } from '@supabase/supabase-js' //import the correct type



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
	// const [user, setUser] = useState<null | { id: string }>(null)
	const [user, setUser] = useState<User | null>(null) // use full User type

	useEffect(() => {
		// Initial load
		supabase.auth.getUser().then(({ data }) => {
			setUser(data.user)
		})

		// Listen for changes
		const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null)
		})

		// Clean up
		return () => {
			authListener.subscription.unsubscribe()
		}
	}, [])

	return user
}