import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { TLShapeId, useEditor } from 'tldraw'

const ToolChainEditorOverlay = forwardRef((props, ref) => {
	const [editingNodeId, setEditingNodeId] = useState<string | null>(null)
	const [editingValue, setEditingValue] = useState('')
	const inputRef = useRef<HTMLInputElement>(null)
	const editor = useEditor()

	// 暴露 startEditing 方法给父组件
	useImperativeHandle(ref, () => ({
		startEditing: (nodeId: string, value: string) => {
			setEditingNodeId(nodeId)
			setEditingValue(value)
			setTimeout(() => {
				inputRef.current?.focus()
			}, 0)
		},
	}))

	const stopEditing = () => {
		setEditingNodeId(null)
		setEditingValue('')
	}

	const saveEditing = () => {
		if (!editingNodeId) return
		const shape = editor.getShape(editingNodeId as TLShapeId)
		if (!shape) return
		editor.updateShape({
			id: editingNodeId as TLShapeId,
			type: 'tool-node',
			props: { ...shape.props, inputValue: editingValue },
		})
		stopEditing()
	}

	if (!editingNodeId) return null
	const shape = editor.getShape(editingNodeId as TLShapeId)
	if (!shape) return null
	const bounds = editor.getShapePageBounds(editingNodeId as TLShapeId)
	if (!bounds) return null
	const screenPos = editor.pageToScreen({ x: bounds.minX, y: bounds.minY })

	return (
		<input
			ref={inputRef}
			style={{
				position: 'absolute',
				left: screenPos.x,
				top: screenPos.y,
				width: bounds.width,
				height: bounds.height,
				fontSize: 16,
				zIndex: 1000,
				background: 'white',
				border: '1px solid #888',
				borderRadius: 4,
				boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
				padding: 4,
			}}
			value={editingValue}
			onChange={(e) => setEditingValue(e.target.value)}
			onBlur={saveEditing}
			onKeyDown={(e) => {
				if (e.key === 'Enter') saveEditing()
				if (e.key === 'Escape') stopEditing()
			}}
		/>
	)
})

export default ToolChainEditorOverlay
