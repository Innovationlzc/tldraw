import { useEffect, useRef, useState } from 'react'
import type { TLAnyShapeUtilConstructor } from 'tldraw'
import {
	DefaultToolbar,
	DefaultToolbarContent,
	TLComponents,
	Tldraw,
	TldrawUiButton,
	TldrawUiMenuItem,
	createShapeId,
	useEditor,
	useTools,
} from 'tldraw'
import 'tldraw/tldraw.css'
import ToolChainEditorOverlay from './ToolChainEditorOverlay'
import { ToolEdgeShapeUtil } from './ToolEdgeShape'
import { ToolNodeShapeUtil } from './ToolNodeShape'

const NODE_TYPES = [
	{ type: 'input', label: 'Input', color: '#1976d2' },
	{ type: 'agent', label: 'Agent', color: '#43a047' },
	{ type: 'output', label: 'Output', color: '#fbc02d' },
	{ type: 'if', label: 'If', color: '#e64a19' },
]

export default function ToolChainEditorExample() {
	const [isToolChainMode, setIsToolChainMode] = useState(false)
	const [selectedNodeType, setSelectedNodeType] = useState(NODE_TYPES[0])
	const overlayRef = useRef<{ startEditing: (id: string, value: string) => void }>(null)

	// 保留 overlayRef 相关逻辑和 window.tldrawToolChain_onEdit 注册

	// shapeUtils registration
	const shapeUtils: TLAnyShapeUtilConstructor[] = [ToolNodeShapeUtil, ToolEdgeShapeUtil]

	// Custom Toolbar, insert Tool Chain Editor button and node type selection
	const components: TLComponents = {
		Toolbar: (props) => {
			const tools = useTools()
			const editor = useEditor()
			// Get the center point of the canvas
			const getCenterPagePoint = () => {
				const bounds = editor.getViewportScreenBounds()
				const center = {
					x: (bounds.minX + bounds.maxX) / 2,
					y: (bounds.minY + bounds.maxY) / 2,
				}
				return editor.screenToPage(center)
			}
			return (
				<DefaultToolbar {...props}>
					<TldrawUiMenuItem
						id="tool-chain-editor"
						label="Tool Chain Editor"
						icon="link"
						isSelected={isToolChainMode}
						onSelect={() => setIsToolChainMode((v) => !v)}
					/>
					{isToolChainMode && (
						<div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8 }}>
							<span style={{ fontSize: 13, color: '#888' }}>Add Node:</span>
							{NODE_TYPES.map((nt) => (
								<TldrawUiButton
									key={nt.type}
									type={selectedNodeType.type === nt.type ? 'primary' : 'normal'}
									style={{
										fontSize: 13,
										padding: '2px 8px',
										borderColor: nt.color,
										color: nt.color,
									}}
									onClick={() => {
										setSelectedNodeType(nt)
										// Directly add node at the center of the canvas
										const pagePoint = getCenterPagePoint()
										editor.createShape({
											type: 'tool-node',
											x: pagePoint.x - 60,
											y: pagePoint.y - 24,
											props: { label: nt.label, color: nt.color, w: 120, h: 48, nodeType: nt.type },
										})
									}}
								>
									{nt.label}
								</TldrawUiButton>
							))}
						</div>
					)}
					<DefaultToolbarContent />
				</DefaultToolbar>
			)
		},
		InFrontOfTheCanvas: () => (
			<ToolChainEditorCanvasEvents
				isToolChainMode={isToolChainMode}
				selectedNodeType={selectedNodeType}
			/>
		),
	}

	// 在 window 上声明 tldrawToolChain_onEdit
	if (typeof window !== 'undefined') {
		window.tldrawToolChain_onEdit = (nodeId: string, value: string) => {
			overlayRef.current?.startEditing(nodeId, value)
		}
	}

	return (
		<div className="tldraw__editor">
			<Tldraw
				components={components}
				shapeUtils={shapeUtils}
				persistenceKey="tool-chain-editor"
				onMount={(editor) => {
					;(window as any).tldrawEditor = editor
				}}
				// 传递 onEdit 回调给 shapeUtil（通过 window 共享）
			>
				<ToolChainEditorOverlay ref={overlayRef} />
			</Tldraw>
			{/* Show current mode at the bottom right corner */}
			<div
				style={{
					position: 'absolute',
					right: 24,
					bottom: 24,
					zIndex: 10,
					fontSize: 16,
					color: '#888',
					pointerEvents: 'none',
				}}
			>
				Current mode: {isToolChainMode ? 'Tool Chain Editor' : 'Normal'}
			</div>
		</div>
	)
}

function ToolChainEditorCanvasEvents({
	isToolChainMode,
	selectedNodeType,
}: {
	isToolChainMode: boolean
	selectedNodeType: { type: string; label: string; color: string }
}) {
	const editor = useEditor()
	// Drag connection state
	const dragState = (window as any)._toolChainDragState || {
		fromId: null,
		fromPoint: null,
		previewLine: null,
	}

	useEffect(() => {
		if (!isToolChainMode) return

		// 1. Click on canvas to add node
		const handlePointerDown = (e: PointerEvent) => {
			// Drag connection start point
			const connector = (e.target as HTMLElement).closest('.tool-node-connector') as HTMLElement
			if (connector) {
				e.stopPropagation()
				const fromId = connector.dataset.shapeid!
				const fromShape = editor.getShape(createShapeId(fromId)) as any
				if (!fromShape || fromShape.type !== 'tool-node') return
				const fromPoint = {
					x: fromShape.x + (fromShape.props.w || 0),
					y: fromShape.y + (fromShape.props.h || 0) / 2,
				}
				dragState.fromId = fromId
				dragState.fromPoint = fromPoint
				dragState.previewLine = editor.createShape({
					type: 'tool-edge',
					x: 0,
					y: 0,
					props: {
						x1: fromPoint.x,
						y1: fromPoint.y,
						x2: fromPoint.x,
						y2: fromPoint.y,
						color: '#888',
					},
				})
				window.addEventListener('pointermove', handlePointerMove)
				window.addEventListener('pointerup', handlePointerUp)
				return
			}
			// Normal add node
			if (e.button !== 0) return
			if (!(e.target as HTMLElement).closest('.tl-canvas')) return
			const pagePoint = editor.screenToPage({ x: e.clientX, y: e.clientY })
			editor.createShape({
				type: 'tool-node',
				x: pagePoint.x - 60,
				y: pagePoint.y - 24,
				props: {
					label: selectedNodeType.label,
					color: selectedNodeType.color,
					w: 120,
					h: 48,
					nodeType: selectedNodeType.type,
				},
			})
		}

		// 2. Preview line follows mouse during drag
		const handlePointerMove = (e: PointerEvent) => {
			if (!dragState.previewLine) return
			const pagePoint = editor.screenToPage({ x: e.clientX, y: e.clientY })
			editor.updateShape({
				id: dragState.previewLine.id,
				type: 'tool-edge',
				props: { ...dragState.previewLine.props, x2: pagePoint.x, y2: pagePoint.y },
			})
		}

		// 3. On drag release, check if over another node
		const handlePointerUp = (e: PointerEvent) => {
			if (!dragState.previewLine) return
			const pagePoint = editor.screenToPage({ x: e.clientX, y: e.clientY })
			// Find target node
			const shapes = editor.getCurrentPageShapes() as any[]
			const toShape = shapes.find(
				(s) =>
					s.type === 'tool-node' &&
					typeof s.x === 'number' &&
					typeof s.y === 'number' &&
					s.props &&
					typeof s.props.w === 'number' &&
					typeof s.props.h === 'number' &&
					pagePoint.x >= s.x &&
					pagePoint.x <= s.x + s.props.w &&
					pagePoint.y >= s.y &&
					pagePoint.y <= s.y + s.props.h &&
					s.id !== dragState.fromId
			)
			if (toShape) {
				// Update connection endpoint to target node center
				editor.updateShape({
					id: dragState.previewLine.id,
					type: 'tool-edge',
					props: {
						...dragState.previewLine.props,
						x2: toShape.x,
						y2: toShape.y + (toShape.props.h || 0) / 2,
					},
				})
			} else {
				// No target node, delete preview line
				editor.deleteShape(dragState.previewLine.id)
			}
			dragState.fromId = null
			dragState.fromPoint = null
			dragState.previewLine = null
			window.removeEventListener('pointermove', handlePointerMove)
			window.removeEventListener('pointerup', handlePointerUp)
		}

		// 4. Delete selected connection with Delete key
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Delete' || e.key === 'Backspace') {
				const selected = editor.getSelectedShapes()
				selected.forEach((s) => {
					if (s.type === 'tool-edge') editor.deleteShape(s.id)
				})
			}
		}

		window.addEventListener('pointerdown', handlePointerDown)
		window.addEventListener('keydown', handleKeyDown)
		return () => {
			window.removeEventListener('pointerdown', handlePointerDown)
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [isToolChainMode, editor, selectedNodeType])

	return null
}
