// import EnhancedToolChainEditorExample from './enhanced-example'

// export default EnhancedToolChainEditorExample
import React, { useState } from 'react'
import ReactDOM, { createRoot } from 'react-dom/client'

import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { supabase } from './file-upload//lib/supabaseClient'
import EnhancedToolChainEditorExample from './enhanced-example'


const Root = () => {
	const [supabaseClient] = useState(() => supabase)

	return (
		<SessionContextProvider supabaseClient={supabaseClient}>
			<EnhancedToolChainEditorExample />
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
