import { createClient } from '@supabase/supabase-js'

console.log('ENV check:', import.meta.env)

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('URL:', supabaseUrl)
console.log('KEY:', supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables are not set.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
