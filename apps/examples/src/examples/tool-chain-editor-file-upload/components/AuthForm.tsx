import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AuthForm() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [mode, setMode] = useState<'login' | 'signup'>('login')

	const handleSubmit = async () => {
		setLoading(true)
		setError(null)

		let error = null

		if (mode === 'login') {
			const result = await supabase.auth.signInWithPassword({ email, password })
			error = result.error
		} else {
			const result = await supabase.auth.signUp({ email, password })
			error = result.error
		}

		if (error) {
			setError(error.message)
		}
		setLoading(false)
	}

	return (
		<div
			style={{
				background: 'white',
				padding: 32,
				borderRadius: 12,
				boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
				width: 320,
				textAlign: 'center',
			}}
		>
			<h2 style={{ marginBottom: 16 }}>
				{mode === 'login' ? 'Log In' : 'Sign Up'}
			</h2>
			<input
				type="email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				placeholder="Email"
				style={{
					width: '100%',
					padding: 10,
					marginBottom: 12,
					borderRadius: 6,
					border: '1px solid #ccc',
				}}
			/>
			<input
				type="password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				placeholder="Password"
				style={{
					width: '100%',
					padding: 10,
					marginBottom: 16,
					borderRadius: 6,
					border: '1px solid #ccc',
				}}
			/>
			<button
				onClick={handleSubmit}
				disabled={loading}
				style={{
					width: '100%',
					padding: 10,
					backgroundColor: '#007bff',
					color: 'white',
					border: 'none',
					borderRadius: 6,
					cursor: 'pointer',
					fontWeight: 600,
				}}
			>
				{loading ? 'Processing...' : mode === 'login' ? 'Log In' : 'Sign Up'}
			</button>
			<p style={{ marginTop: 16 }}>
				{mode === 'login' ? 'No account?' : 'Already have an account?'}{' '}
				<button
					onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
					style={{
						background: 'none',
						border: 'none',
						color: '#007bff',
						cursor: 'pointer',
						fontWeight: 600,
					}}
				>
					{mode === 'login' ? 'Sign Up' : 'Log In'}
				</button>
			</p>
			{error && <p style={{ color: 'red', marginTop: 12 }}>{error}</p>}
		</div>
	)
}
