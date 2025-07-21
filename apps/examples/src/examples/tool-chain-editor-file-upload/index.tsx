import React, { useState } from 'react'
import ReactDOM, { createRoot } from 'react-dom/client'

import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { supabase } from './lib/supabaseClient'

import FileUploadToolChainEditorExample from './components/FileUploadToolChainEditorExample'

const Root = () => {
	const [supabaseClient] = useState(() => supabase)

	return (
		<SessionContextProvider supabaseClient={supabaseClient}>
			<FileUploadToolChainEditorExample />
		</SessionContextProvider>
	)
}

const container = document.getElementById('root')
const root = createRoot(container!)

root.render(
	<React.StrictMode>
		<Root />
	</React.StrictMode>
)
