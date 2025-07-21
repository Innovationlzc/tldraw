import OnlyEditorExample from '../../only-editor/OnlyEditorExample'
import FileUploadToolChainEditor from '../FileUploadToolChainEditor'
import { useSupabaseUser } from '../lib/supabaseUtils'
import AuthForm from './AuthForm'

export default function FileUploadToolChainEditorExample() {
	const user = useSupabaseUser()

	if (!user) {
		// Not logged in → show AuthForm centered
		return (
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					width: '100vw',
					height: '100vh',
					background: '#f0f0f0',
				}}
			>
				<AuthForm />
			</div>
		)
	}

	// Logged in → show ToolChainEditor + canvas overlay
	return (
		<div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#f4f4f4' }}>
			<OnlyEditorExample />
			<div
				style={{
					position: 'absolute',
					top: 40,
					left: 40,
					right: 40,
					zIndex: 10,
					pointerEvents: 'auto',
					boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
					borderRadius: 12,
					background: 'rgba(255,255,255,0.95)',
					padding: 24,
					maxWidth: 1200,
					margin: '0 auto',
				}}
			>
				<h2 style={{ marginBottom: 16 }}>
					Tool Chain Editor (Demo){' '}
					<span style={{ fontSize: 14, marginLeft: 16 }}>
						Logged in as <strong>{user.email}</strong>{' '}
						<button
							style={{
								marginLeft: 12,
								fontSize: 12,
								border: 'none',
								background: '#eee',
								padding: '4px 8px',
								borderRadius: 4,
								cursor: 'pointer',
							}}
							onClick={() => {
								import('../lib/supabaseClient').then(({ supabase }) => supabase.auth.signOut())
							}}
						>
							Log out
						</button>
					</span>
				</h2>
				<FileUploadToolChainEditor />
			</div>
		</div>
	)
}