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

	const SUPABASE_URL = 'https://dmhftlaiiulqvuzlzdvo.supabase.co' // project id from Supabase
	const getPublicFileURL = (path: string) =>
	`${SUPABASE_URL}/storage/v1/object/public/user-files/${path}`

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
				onChange={(e) => {
						setQuery(e.target.value)
						setSelected(null) // clears on every change
					}}
				onKeyDown={(e) => {
					if (e.key === 'Enter' && results.length > 0) {
						onSelect(results[0])
						setSelected(results[0])
					}
				}}
				onFocus={() => setSelected(null)} // clears selection
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
						marginTop: 8,
						padding: '12px 14px',
						border: '1px solid #ddd',
						borderRadius: 8,
						background: '#fff',
						boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
						fontFamily: 'Inter, sans-serif',
						fontSize: 14,
						lineHeight: 1.5,
					}}
				>
					<div style={{ fontWeight: 600, fontSize: 15 }}>{selected.file_name}</div>
					<div style={{ color: '#555', marginBottom: 8 }}>
						{selected.mime_type} • {Math.round(selected.size / 1024)} KB
					</div>

					{/* Image Preview */}
					{selected.mime_type.startsWith('image/') && (
						<img
							src={getPublicFileURL(selected.storage_url)}
							alt={selected.file_name}
							style={{
								width: '100%',
								maxHeight: 160,
								objectFit: 'cover',
								borderRadius: 6,
								border: '1px solid #eee',
							}}
						/>
					)}

					{/* Text file icon */}
					{selected.mime_type === 'text/plain' && (
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 8,
								color: '#333',
							}}
						>
							📄 Plain text file
						</div>
					)}

					{/* PDF icon */}
					{selected.mime_type === 'application/pdf' && (
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 8,
								color: '#333',
							}}
						>
							📕 PDF file
						</div>
					)}
				</div>
			)}


		</div>
	)
}
