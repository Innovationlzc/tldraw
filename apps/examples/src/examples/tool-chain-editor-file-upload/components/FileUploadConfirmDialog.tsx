import React, { useEffect, useRef, useState } from 'react'

export function FileUploadConfirmDialog({
	file,
	anchorRef,
	onConfirm,
	onCancel,
}: {
	file: File
	anchorRef: React.RefObject<HTMLElement>
	onConfirm: () => void
	onCancel: () => void
}) {
	const popupRef = useRef<HTMLDivElement>(null)
	const [position, setPosition] = useState({ top: 80, left: 10 })

	useEffect(() => {
		if (anchorRef.current) {
			const rect = anchorRef.current.getBoundingClientRect()
			setPosition({
				top: rect.bottom + window.scrollY + 12, // 12px below the node
				left: rect.left + window.scrollX,
			})
		}
	}, [anchorRef])

	if (!file) return null


	// ✅ Add handlers for debug visibility
	const handleCancel = () => {
		console.log('❌ Cancel clicked')
		onCancel()
	}

	const handleConfirm = () => {
		console.log('✅ Upload clicked')
		onConfirm()
	}
	return (
		<div
			ref={popupRef}
			style={{
				position: 'absolute',
				top: position.top,
				left: position.left,
				zIndex: 10,
				background: 'white',
				padding: 10,
				borderRadius: 8,
				boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
				display: 'flex',
				flexDirection: 'column',
				gap: 10,
			}}
		>
			<div style={{ fontWeight: 'bold', fontSize: 16 }}>Upload File?</div>
			<div style={{ fontSize: 14 }}>
				Would you like to upload <strong>{file.name}</strong> to Supabase?
			</div>
			<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
				<button
					onClick={() => {
						console.log('🟡 Button clicked')
						handleCancel()
					}}
					style={{
						padding: '4px 12px',
						border: '1px solid #ccc',
						borderRadius: 6,
						cursor: 'pointer',
						background: '#fff',
					}}
				>
					Cancel
				</button>
				<button
					onClick={() => {
						console.log('🟡 Button clicked')
						handleConfirm()
					}}					
					style={{
						padding: '4px 12px',
						background: '#007bff',
						color: 'white',
						border: 'none',
						borderRadius: 6,
						cursor: 'pointer',
					}}
				>
					Upload
				</button>
			</div>
		</div>
	)
}
