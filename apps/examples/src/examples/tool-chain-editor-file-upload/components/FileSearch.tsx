import { useEffect, useRef, useState } from 'react'
import { searchUserFiles } from '../lib/searchFiles'
import { useSession } from '@supabase/auth-helpers-react'

export function FileSearch({ onSelect }: { onSelect: (file: any) => void }) {
	const inputRef = useRef<HTMLInputElement>(null)
	const [results, setResults] = useState<any[]>([])
	const [query, setQuery] = useState('')
	const [selected, setSelected] = useState<any | null>(null)

	const session = useSession()
	const userId = session?.user?.id ?? null

	useEffect(() => {
		const delayDebounce = setTimeout(async () => {
			if (query.trim()) {
				try {
					const files = await searchUserFiles(query.trim(), userId)
					setResults(files)
				} catch (e) {
					console.error(e)
				}
			} else {
				setResults([])
			}
		}, 300)

		return () => clearTimeout(delayDebounce)
	}, [query, userId])

	return (
		<div
			style={{
				background: 'white',
				border: '1px solid #ccc',
				borderRadius: 8,
				boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
				width: 280,
				padding: 8,
				flexShrink: 0, // prevents from shrinking in flex layout
			}}
		>
			<input
				ref={inputRef}
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === 'Enter' && results.length > 0) {
						onSelect(results[0])
						setSelected(results[0])
					}
				}}
				placeholder="Search files..."
				style={{
					width: '100%',
					padding: '6px 10px',
					borderRadius: 6,
					border: '1px solid #ccc',
					marginBottom: 20,
				}}
			/>

			<div>
				{results.map((file) => (
					<div
						key={file.id}
						onClick={() => {
							onSelect(file)
							setSelected(file)
						}}
						style={{
							padding: '4px 8px',
							borderRadius: 6,
							cursor: 'pointer',
							transition: 'background 0.2s',
						}}
						onMouseEnter={(e) =>
							(e.currentTarget.style.backgroundColor = '#f0f0f0')
						}
						onMouseLeave={(e) =>
							(e.currentTarget.style.backgroundColor = 'transparent')
						}
					>
						{file.file_name}
					</div>
				))}
			</div>

			{/* Inline render */}
			{selected && (
				<div
					style={{
						marginTop: 12,
						padding: 10,
						background: '#f9f9f9',
						borderTop: '1px solid #ccc',
						borderRadius: 6,
					}}
				>
					<strong>{selected.file_name}</strong>
					<p>{selected.mime_type}</p>
					<p>{Math.round(selected.size / 1024)} KB</p>
				</div>
			)}
			{query.trim() && results.length === 0 && (
				<div style={{ padding: '4px 8px', color: '#888' }}>No files found.</div>
			)}
		</div>
	)
}
