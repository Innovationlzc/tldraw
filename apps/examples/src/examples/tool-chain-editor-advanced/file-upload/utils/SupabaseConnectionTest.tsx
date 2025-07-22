import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function SupabaseConnectionTest() {
  const [message, setMessage] = useState('Connecting...')

  useEffect(() => {
    const testConnection = async () => {
      const { data, error } = await supabase.from('files').select('*').limit(1)
      if (error) {
        setMessage(`Connection failed: ${error.message}`)
      } else {
        setMessage(`Connected! ${data.length} row(s) retrieved.`)
      }
    }

    testConnection()
  }, [])

  return (
    <div style={{ padding: '1rem', fontFamily: 'monospace' }}>
      <h2>Supabase Connection Test</h2>
      <p>{message}</p>
    </div>
  )
}
