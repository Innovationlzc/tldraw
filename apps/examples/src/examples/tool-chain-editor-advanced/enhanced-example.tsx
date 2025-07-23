import React, { useEffect, useState } from 'react'
import EnhancedToolChainEditor from './enhanced-tool-chain-editor'
import { EnhancedToolRegistry, defaultToolSets } from './enhanced-tool-registry'

// ==================== New ChatbotPanel and StepsPanel Placeholders ====================
function ChatbotPanel({
	chatHistory,
	onSendPrompt,
	isLoading,
}: {
	chatHistory: { role: 'user' | 'ai'; content: string; isLoading?: boolean }[]
	onSendPrompt: (prompt: string) => void
	isLoading: boolean
}) {
	const [inputValue, setInputValue] = useState('')
	const chatEndRef = React.useRef<HTMLDivElement>(null)
	const [ellipsis, setEllipsis] = React.useState('')

	// Animate ellipsis when loading
	React.useEffect(() => {
		if (isLoading) {
			let i = 0
			const interval = setInterval(() => {
				setEllipsis('.'.repeat((i % 3) + 1))
				i++
			}, 400)
			return () => clearInterval(interval)
		} else {
			setEllipsis('')
			return undefined
		}
	}, [isLoading])

	React.useEffect(() => {
		chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [chatHistory])

	return (
		<div
			style={{
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				background: 'linear-gradient(135deg, #f8fafc 0%, #e3e9f7 100%)',
				borderRight: '1px solid #e3e3e3',
				boxShadow: '2px 0 12px #e3e3e3',
			}}
		>
			{/* Header */}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 12,
					padding: '20px 24px 12px 24px',
					borderBottom: '1px solid #e3e3e3',
					background: 'rgba(255,255,255,0.85)',
					boxShadow: '0 2px 8px #f0f0f0',
				}}
			>
				<span style={{ fontSize: 28, color: '#6f42c1' }}>💬</span>
				<span style={{ fontWeight: 700, fontSize: 20, color: '#333', letterSpacing: 0.5 }}>
					AI Assistant
				</span>
			</div>

			{/* Chat History */}
			<div
				style={{ flex: 1, overflowY: 'auto', padding: '24px 16px 12px 16px', background: 'none' }}
			>
				{chatHistory.length === 0 && (
					<div style={{ textAlign: 'center', color: '#aaa', marginTop: 60, fontSize: 16 }}>
						Start a conversation with your AI assistant!
					</div>
				)}
				{chatHistory.map((msg, i) => (
					<div
						key={i}
						style={{
							display: 'flex',
							justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
							marginBottom: 16,
						}}
					>
						<div
							style={{
								background:
									msg.role === 'user'
										? 'linear-gradient(135deg, #6f42c1 60%, #8e7be7 100%)'
										: 'linear-gradient(135deg, #f1f8e9 60%, #e3f2fd 100%)',
								color: msg.role === 'user' ? '#fff' : '#333',
								borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
								padding: '12px 16px',
								maxWidth: 320,
								fontSize: 15,
								boxShadow: msg.role === 'user' ? '0 2px 8px #d1c4e9' : '0 2px 8px #e3e3e3',
								whiteSpace: 'pre-line',
							}}
						>
							{msg.isLoading ? `……${ellipsis}` : msg.content}
						</div>
					</div>
				))}
				<div ref={chatEndRef} />
			</div>

			{/* Input Area */}
			<div
				style={{
					padding: '18px 20px',
					borderTop: '1px solid #e3e3e3',
					background: 'rgba(255,255,255,0.95)',
					boxShadow: '0 -2px 8px #f0f0f0',
				}}
			>
				<form
					onSubmit={(e) => {
						e.preventDefault()
						if (inputValue.trim()) {
							onSendPrompt(inputValue)
							setInputValue('')
						}
					}}
					style={{ display: 'flex', alignItems: 'center', gap: 10 }}
				>
					<input
						type="text"
						name="prompt"
						placeholder="Type your task or question..."
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						style={{
							flex: 1,
							padding: '12px 16px',
							borderRadius: 24,
							border: '1.5px solid #c3c3e5',
							fontSize: 15,
							outline: 'none',
							background: '#f7f7fb',
							transition: 'border 0.2s',
						}}
						onFocus={(e) => (e.currentTarget.style.border = '1.5px solid #6f42c1')}
						onBlur={(e) => (e.currentTarget.style.border = '1.5px solid #c3c3e5')}
					/>
					<button
						type="submit"
						style={{
							marginLeft: 4,
							padding: '10px 22px',
							borderRadius: 24,
							background: 'linear-gradient(90deg, #6f42c1 60%, #8e7be7 100%)',
							color: '#fff',
							border: 'none',
							fontWeight: 600,
							fontSize: 15,
							boxShadow: '0 2px 8px #d1c4e9',
							cursor: 'pointer',
							transition: 'background 0.2s, box-shadow 0.2s',
						}}
						onMouseOver={(e) =>
							(e.currentTarget.style.background =
								'linear-gradient(90deg, #8e7be7 60%, #6f42c1 100%)')
						}
						onMouseOut={(e) =>
							(e.currentTarget.style.background =
								'linear-gradient(90deg, #6f42c1 60%, #8e7be7 100%)')
						}
					>
						Send
					</button>
				</form>
			</div>
		</div>
	)
}

function StepsPanel({
	steps,
	onDragStart,
}: {
	steps: string[]
	onDragStart: (step: string, e: React.DragEvent) => void
}) {
	// Placeholder for draggable steps UI
	return (
		<div style={{ padding: 16, background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
			<h4 style={{ margin: '0 0 8px 0' }}>AI-Suggested Steps</h4>
			<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
				{steps.map((step, i) => (
					<div
						key={i}
						style={{
							background: '#fff',
							border: '1px solid #ddd',
							borderRadius: 6,
							padding: 8,
							cursor: 'grab',
						}}
						draggable
						onDragStart={(e) => onDragStart(step, e)}
					>
						{step}
					</div>
				))}
			</div>
		</div>
	)
}

// ==================== Enhanced Example Component ====================

export default function EnhancedToolChainEditorExample() {
	const [toolSets, setToolSets] = useState(defaultToolSets)
	const [workflow, setWorkflow] = useState<any>(null)
	const [results, setResults] = useState<Record<string, any>>({})
	const [loading, setLoading] = useState(false)
	const [statistics, setStatistics] = useState<any>(null)
	const [showToolSets, setShowToolSets] = useState(false)
	const [showWorkflowInfo, setShowWorkflowInfo] = useState(false)
	// Remove showChatbot, generatedNodes, generatedEdges for new flow

	// Chatbot and steps state
	const [chatHistory, setChatHistory] = useState<
		{ role: 'user' | 'ai'; content: string; isLoading?: boolean }[]
	>([])
	const [steps, setSteps] = useState<string[]>([])
	const [isLoading, setIsLoading] = useState(false)

	// Ref to EnhancedToolChainEditor instance to call handleAddNode
	const toolChainEditorRef = React.useRef<any>(null)

	// Initialize tool registry
	const [toolRegistry] = useState(() => new EnhancedToolRegistry(toolSets))

	// Update statistics
	useEffect(() => {
		setStatistics(toolRegistry.getStatistics())
	}, [toolRegistry])

	// Handle workflow change
	const handleWorkflowChange = (newWorkflow: any) => {
		setWorkflow(newWorkflow)
		console.log('Workflow updated:', newWorkflow)
	}

	// Handle tool set load
	const handleToolSetLoad = (toolSetId: string) => {
		console.log(`ToolSet ${toolSetId} loaded successfully`)
		// Update statistics
		setStatistics(toolRegistry.getStatistics())
	}

	// Load tool sets from backend
	const loadToolSetsFromBackend = async () => {
		setLoading(true)
		try {
			const response = await fetch('/api/toolsets')
			if (response.ok) {
				const data = await response.json()
				if (data.success) {
					// Register new tool sets
					data.toolsets.forEach((toolSet: any) => {
						toolRegistry.registerToolSet(toolSet)
					})
					setToolSets(toolRegistry.getAllToolSets())
					setStatistics(toolRegistry.getStatistics())
					console.log('ToolSets loaded from backend:', data.toolsets)
				}
			}
		} catch (error) {
			console.error('Failed to load toolsets from backend:', error)
		} finally {
			setLoading(false)
		}
	}

	// Save workflow to backend
	const saveWorkflowToBackend = async () => {
		if (!workflow) {
			alert('No workflow to save')
			return
		}

		try {
			const response = await fetch('/api/workflows', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(workflow),
			})

			if (response.ok) {
				const data = await response.json()
				if (data.success) {
					alert(`Workflow saved successfully! ID: ${data.workflowId}`)
				}
			}
		} catch (error) {
			console.error('Failed to save workflow:', error)
			alert('Failed to save workflow')
		}
	}

	// Execute workflow
	const executeWorkflow = async () => {
		if (!workflow) {
			alert('No workflow to execute')
			return
		}

		setLoading(true)
		try {
			// Simulate workflow execution
			await new Promise((resolve) => setTimeout(resolve, 2000))
			alert('Workflow executed successfully!')
		} catch (error) {
			console.error('Failed to execute workflow:', error)
			alert('Failed to execute workflow')
		} finally {
			setLoading(false)
		}
	}

	// Handle toolchain generation
	const handleGenerateToolchain = (nodes: any[], edges: any[]) => {
		// setGeneratedNodes(nodes) // Removed
		// setGeneratedEdges(edges) // Removed
		console.log('Generated toolchain:', { nodes, edges })
	}

	// Reset workflow
	const resetWorkflow = () => {
		setWorkflow(null)
		setResults({})
		// setGeneratedNodes([]) // Removed
		// setGeneratedEdges([]) // Removed
	}

	// Add a function to clear all nodes in the workflow
	const clearWorkflow = () => {
		if (toolChainEditorRef.current && toolChainEditorRef.current.clearAllNodes) {
			toolChainEditorRef.current.clearAllNodes()
		}
	}

	// When steps change, clear and add input nodes for all steps
	React.useEffect(() => {
		if (
			steps.length > 0 &&
			toolChainEditorRef.current &&
			toolChainEditorRef.current.addInputNodeForStep
		) {
			clearWorkflow()
			steps.forEach((step: string, idx: number) => {
				toolChainEditorRef.current.addInputNodeForStep(step, idx)
			})
		}
	}, [steps])

	// When a new prompt is sent, clear steps and workflow
	const handleSendPrompt = async (prompt: string) => {
		setSteps([])
		clearWorkflow()
		setChatHistory((h) => [...h, { role: 'user', content: prompt }])
		setIsLoading(true)
		// Add loading indicator message
		setChatHistory((h) => [...h, { role: 'ai', content: '……', isLoading: true }])

		const engineeredPrompt = `List exactly 3 to 5 concise steps to answer the following question. Only output the steps, each on a new line, numbered (1. 2. 3. ...). Do not include any introduction, explanation, markdown, or optional text.\n\nQuestion: ${prompt}`

		try {
			const response = await fetch('/api/tools/deepseek-agent', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ question: engineeredPrompt }),
			})
			const data = await response.json()
			if (data.success && data.result && data.result.response) {
				const answer = data.result.response.trim()
				// Replace the last AI loading message with the real answer
				setChatHistory((h) => {
					const idx = h
						.map((m, i) => (m.role === 'ai' && m.isLoading ? i : -1))
						.filter((i) => i !== -1)
						.pop()
					if (typeof idx === 'number' && idx >= 0) {
						return [...h.slice(0, idx), { role: 'ai', content: answer }]
					}
					return [...h, { role: 'ai', content: answer }]
				})

				const stepLines = answer.split(/\n|\r/).filter((line: string) => /^\s*\d+\./.test(line))
				const stepsExtracted = stepLines
					.map((line: string) => line.replace(/^\s*\d+\.\s*/, '').trim())
					.filter((s: string) => Boolean(s))
				if (stepsExtracted.length >= 3) {
					setSteps(stepsExtracted)
				} else {
					const fallbackSteps = answer
						.split(/\.|\n/)
						.map((s: string) => s.trim())
						.filter((s: string) => Boolean(s))
					setSteps(fallbackSteps.slice(0, 5))
				}
			} else {
				setChatHistory((h) => {
					const idx = h
						.map((m, i) => (m.role === 'ai' && m.isLoading ? i : -1))
						.filter((i) => i !== -1)
						.pop()
					if (typeof idx === 'number' && idx >= 0) {
						return [
							...h.slice(0, idx),
							{ role: 'ai', content: 'Sorry, I could not get a response from the LLM.' },
						]
					}
					return [...h, { role: 'ai', content: 'Sorry, I could not get a response from the LLM.' }]
				})
				const mockSteps = prompt
					.split(/\band\b|\./i)
					.map((s) => s.trim())
					.filter(Boolean)
				setSteps(mockSteps)
			}
		} catch (err) {
			setChatHistory((h) => {
				const idx = h
					.map((m, i) => (m.role === 'ai' && m.isLoading ? i : -1))
					.filter((i) => i !== -1)
					.pop()
				if (typeof idx === 'number' && idx >= 0) {
					return [
						...h.slice(0, idx),
						{ role: 'ai', content: 'Sorry, there was an error calling the LLM.' },
					]
				}
				return [...h, { role: 'ai', content: 'Sorry, there was an error calling the LLM.' }]
			})
			const mockSteps = prompt
				.split(/\band\b|\./i)
				.map((s) => s.trim())
				.filter(Boolean)
			setSteps(mockSteps)
		}
		setIsLoading(false)
	}

	// Drag start handler for steps (to be integrated with tool chain editor)
	const handleStepDragStart = (step: string, e: React.DragEvent) => {
		e.dataTransfer.setData('text/plain', step)
	}

	return (
		<div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
			{/* Left: Chatbot Panel */}
			<div
				style={{
					width: '40%',
					minWidth: 320,
					maxWidth: 520,
					height: '100%',
					boxShadow: '2px 0 8px #eee',
					zIndex: 2,
				}}
			>
				<ChatbotPanel
					chatHistory={chatHistory}
					onSendPrompt={handleSendPrompt}
					isLoading={isLoading}
				/>
			</div>
			{/* Right: Only Tool Chain Editor, no StepsPanel */}
			<div
				style={{
					width: '60%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					position: 'relative',
				}}
			>
				<div style={{ flex: 1, minHeight: 0 }}>
					<EnhancedToolChainEditor
						ref={toolChainEditorRef}
						toolSets={toolSets}
						onWorkflowChange={handleWorkflowChange}
						onToolSetLoad={handleToolSetLoad}
					/>
				</div>
			</div>
		</div>
	)
}
