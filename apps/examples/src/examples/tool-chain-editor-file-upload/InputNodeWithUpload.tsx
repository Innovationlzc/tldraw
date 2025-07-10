import React from 'react'
import { Handle, Position } from 'react-flow-renderer'

export default function InputNodeWithUpload({ data, id }: { data: any; id: string }) {
	return (
		<div
			style={{
				padding: 18,
				background: '#fff',
				border: '2px solid #bbb',
				borderRadius: 10,
				minWidth: 260,
				maxWidth: 400,
			}}
		>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<strong style={{ fontSize: 28 }}>Input</strong>
				<button
					onClick={() => data.onDeleteNode(id)}
					style={{
						background: '#ff4444',
						color: 'white',
						border: 'none',
						borderRadius: '50%',
						width: 24,
						height: 24,
						cursor: 'pointer',
						fontSize: 12,
					}}
				>
					×
				</button>
			</div>

			<div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
				<input
					style={{
						flex: 1,
						fontSize: 20,
						padding: 6,
						borderRadius: 6,
						border: '1px solid #ccc',
					}}
					value={data.value}
					onChange={(e) => data.onChange(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter') data.onSubmit()
					}}
					placeholder="Enter Query (Press Enter to submit)"
				/>

				{/* File Upload Button */}
				<label style={{ cursor: 'pointer' }}>
					📎
					<input
						type="file"
						style={{ display: 'none' }}
						onChange={(e) => {
							const file = e.target.files?.[0]
							if (file) {
								data.onUploadFile(file)
							}
						}}
					/>
				</label>
			</div>

			{/* Show selected file name */}
			{data.file && (
				<div style={{ fontSize: 14, marginTop: 8, color: '#555' }}>
					📄 {data.file.name}
				</div>
			)}

			{/* Show image preview if applicable */}
			{data.imagePreview && (
				<img
					src={data.imagePreview}
					alt="preview"
					style={{ marginTop: 8, width: '100%', maxHeight: 150, objectFit: 'contain', borderRadius: 8 }}
				/>
			)}


			<Handle type="source" position={Position.Right} />
		</div>
	)
}
