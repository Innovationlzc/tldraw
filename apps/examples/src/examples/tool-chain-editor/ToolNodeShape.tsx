import { HTMLContainer, RecordProps, Rectangle2d, ShapeUtil, T, TLBaseShape } from 'tldraw'

export type IToolNodeShape = TLBaseShape<
	'tool-node',
	{
		w: number
		h: number
		label: string
		color: string
		nodeType?: string
		inputValue?: string
		outputValue?: string
		agentLoading?: boolean
	}
>

// 在文件顶部添加 window 类型扩展声明
declare global {
	interface Window {
		tldrawToolChain_onEdit?: (nodeId: string, value: string) => void
	}
}

export class ToolNodeShapeUtil extends ShapeUtil<IToolNodeShape> {
	static override type = 'tool-node' as const
	static override props: RecordProps<IToolNodeShape> = {
		w: T.number,
		h: T.number,
		label: T.string,
		color: T.string,
		nodeType: T.optional(T.string),
		inputValue: T.optional(T.string),
		outputValue: T.optional(T.string),
		agentLoading: T.optional(T.boolean),
	}

	override getDefaultProps(): IToolNodeShape['props'] {
		return {
			w: 120,
			h: 48,
			label: 'Tool',
			color: '#222',
			nodeType: 'agent',
		}
	}

	override canEdit() {
		return true
	}
	override canResize() {
		return true
	}
	override isAspectRatioLocked() {
		return false
	}

	override getGeometry(shape: IToolNodeShape) {
		return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: true,
		})
	}

	override component(shape: IToolNodeShape) {
		// Connection point coordinates
		const cx = shape.props.w
		const cy = shape.props.h / 2
		// Determine node type
		const nodeType = shape.props.nodeType || 'agent'
		// Editor instance for updating shape props (will be set globally)
		const editor = (window as any).tldrawEditor
		// Input value state (for input node)
		let inputValue = shape.props.inputValue || ''
		// Output value (for output node)
		let outputValue = shape.props.outputValue || ''
		// Agent running state (for agent node)
		let agentLoading = shape.props.agentLoading || false

		// Render different UI for each node type
		return (
			<HTMLContainer
				style={{
					width: shape.props.w,
					height: shape.props.h,
					border: `2px solid ${shape.props.color}`,
					borderRadius: 8,
					background: '#fff',
					color: shape.props.color,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontWeight: 600,
					fontSize: 16,
					position: 'relative',
				}}
				onDoubleClick={
					nodeType === 'input'
						? (e) => {
								e.stopPropagation()
								if (
									typeof window !== 'undefined' &&
									typeof window.tldrawToolChain_onEdit === 'function'
								) {
									window.tldrawToolChain_onEdit(shape.id, inputValue)
								}
							}
						: undefined
				}
			>
				{/* Render node content by type */}
				{nodeType === 'input' && (
					<input
						style={{ width: '80%', fontSize: 14, color: '#222' }}
						value={inputValue}
						placeholder="Enter query..."
						onChange={(e) => {
							if (editor) {
								editor.updateShape({
									id: shape.id,
									type: 'tool-node',
									props: { ...shape.props, inputValue: e.target.value },
								})
							}
						}}
						onPointerDown={(e) => e.stopPropagation()}
					/>
				)}
				{nodeType === 'agent' && (
					<button
						style={{
							fontSize: 14,
							color: '#fff',
							background: shape.props.color,
							border: 'none',
							borderRadius: 4,
							padding: '4px 12px',
							cursor: 'pointer',
						}}
						disabled={agentLoading}
						onClick={async (e) => {
							e.stopPropagation()
							if (!editor) return
							// Find connected input node (by edge)
							const shapes = editor.getCurrentPageShapes()
							const thisNode = shapes.find((s: any) => s.id === shape.id)
							// Find incoming edge to this agent node
							const incomingEdge = shapes.find(
								(s: any) =>
									s.type === 'tool-edge' &&
									s.props.x2 === thisNode.x &&
									Math.abs(s.props.y2 - (thisNode.y + thisNode.props.h / 2)) < 2
							)
							if (!incomingEdge) {
								alert('No input node connected!')
								return
							}
							// Find input node by edge start
							const inputNode = shapes.find(
								(s: any) =>
									s.type === 'tool-node' &&
									s.props.nodeType === 'input' &&
									Math.abs(s.x + s.props.w - incomingEdge.props.x1) < 2 &&
									Math.abs(s.y + s.props.h / 2 - incomingEdge.props.y1) < 2
							)
							if (!inputNode) {
								alert('Input node not found!')
								return
							}
							const query = inputNode.props.inputValue || ''
							if (!query) {
								alert('Input is empty!')
								return
							}
							// Set loading state
							editor.updateShape({
								id: shape.id,
								type: 'tool-node',
								props: { ...shape.props, agentLoading: true },
							})
							// Call DeepSeek API (replace YOUR_DEEPSEEK_API_KEY below)
							let answer = ''
							try {
								const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
									method: 'POST',
									headers: {
										Authorization: `sk-26d1dcdacd4148b0a27b724af6f8daf7`, // TODO: Replace with your DeepSeek API key
										'Content-Type': 'application/json',
									},
									body: JSON.stringify({
										model: 'deepseek-chat',
										messages: [{ role: 'user', content: query }],
									}),
								})
								const data = await res.json()
								answer = data.choices?.[0]?.message?.content || 'No answer.'
							} catch (err) {
								answer = 'API error.'
							}
							// Set loading false and update output node
							editor.updateShape({
								id: shape.id,
								type: 'tool-node',
								props: { ...shape.props, agentLoading: false },
							})
							// Find connected output node (by outgoing edge)
							const outgoingEdge = shapes.find(
								(s: any) =>
									s.type === 'tool-edge' &&
									s.props.x1 === thisNode.x + thisNode.props.w &&
									Math.abs(s.props.y1 - (thisNode.y + thisNode.props.h / 2)) < 2
							)
							if (outgoingEdge) {
								const outputNode = shapes.find(
									(s: any) =>
										s.type === 'tool-node' &&
										s.props.nodeType === 'output' &&
										s.x === outgoingEdge.props.x2 &&
										Math.abs(s.y + s.props.h / 2 - outgoingEdge.props.y2) < 2
								)
								if (outputNode) {
									editor.updateShape({
										id: outputNode.id,
										type: 'tool-node',
										props: { ...outputNode.props, outputValue: answer },
									})
								}
							}
						}}
					>
						{agentLoading ? 'Running...' : 'Run'}
					</button>
				)}
				{nodeType === 'output' && (
					<div
						style={{
							fontSize: 14,
							color: '#222',
							width: '90%',
							wordBreak: 'break-all',
							textAlign: 'left',
						}}
					>
						{outputValue || 'No output.'}
					</div>
				)}
				{/* Node label for non-input/output types */}
				{nodeType !== 'input' && nodeType !== 'agent' && nodeType !== 'output' && shape.props.label}
				{/* Right connection point */}
				<div
					className="tool-node-connector"
					data-shapeid={shape.id}
					style={{
						position: 'absolute',
						right: -10,
						top: '50%',
						transform: 'translateY(-50%)',
						width: 16,
						height: 16,
						borderRadius: 8,
						background: shape.props.color,
						border: '2px solid #fff',
						cursor: 'crosshair',
						zIndex: 2,
					}}
				/>
			</HTMLContainer>
		)
	}

	indicator(shape: IToolNodeShape) {
		return <rect width={shape.props.w} height={shape.props.h} />
	}
}
