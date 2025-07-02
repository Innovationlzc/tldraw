import { useCallback, useState } from 'react'
import ReactFlow, {
	Background,
	Connection,
	Controls,
	Edge,
	MiniMap,
	Node,
	addEdge,
} from 'react-flow-renderer'

// Tool chain 节点类型定义
interface ToolNode {
	id: string
	type: string
	label: string
	next: string[]
}

// 初始节点定义
const initialToolChain: ToolNode[] = [
	{ id: '1', type: 'input', label: 'When chat message received', next: ['2'] },
	{ id: '2', type: 'agent', label: 'AI Agent', next: ['3'] },
	{ id: '3', type: 'if', label: 'If', next: ['4', '5'] },
	{ id: '4', type: 'success', label: 'Success', next: [] },
	{ id: '5', type: 'failure', label: 'Failure', next: [] },
]

// 工具链转换函数
function transformToolChain(toolChain: ToolNode[]): {
	nodes: Node[]
	edges: Edge[]
} {
	const nodes: Node[] = toolChain.map((tool) => ({
		id: tool.id,
		type: 'default',
		data: { label: tool.label },
		position: { x: Math.random() * 400, y: Math.random() * 400 },
	}))

	const edges: Edge[] = toolChain.flatMap((tool) =>
		tool.next.map((targetId) => ({
			id: `${tool.id}-${targetId}`,
			source: tool.id,
			target: targetId,
			animated: true,
		}))
	)

	return { nodes, edges }
}

export default function ToolChainEditorExample() {
	const { nodes: initialNodes, edges: initialEdges } = transformToolChain(initialToolChain)
	const [nodes, setNodes] = useState<Node[]>(initialNodes)
	const [edges, setEdges] = useState<Edge[]>(initialEdges)

	const setToolChain = useCallback((toolChain: ToolNode[]) => {
		const { nodes, edges } = transformToolChain(toolChain)
		setNodes(nodes)
		setEdges(edges)
	}, [])

	const onConnect = (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds))

	return (
		<div style={{ width: '100%', height: '80vh', background: '#f8f9fa' }}>
			<h2>Tool Chain Editor (自动生成 & 可交互)</h2>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onConnect={onConnect}
				snapToGrid={true}
				snapGrid={[16, 16]}
				style={{ background: '#fff' }}
			>
				<MiniMap />
				<Controls />
				<Background />
			</ReactFlow>
			{/* <button onClick={() => setToolChain(newToolChain)}>导入 LLM 结果</button> */}
		</div>
	)
}
