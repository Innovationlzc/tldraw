import React, { useEffect, useState } from 'react'
import EnhancedToolChainEditor from './enhanced-tool-chain-editor'
import { EnhancedToolRegistry, defaultToolSets } from './enhanced-tool-registry'
// @ts-ignore
import mammoth from 'mammoth'
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist/build/pdf'
// @ts-ignore
import Tesseract from 'tesseract.js'

// ==================== New ChatbotPanel and StepsPanel Placeholders ====================
function ChatbotPanel({
	chatHistory,
	onSendPrompt,
	isLoading,
	setChatHistory,
}: {
	chatHistory: {
		role: 'user' | 'ai'
		content: string
		isLoading?: boolean
		fileName?: string
		filePreview?: string
		fileType?: string
	}[]
	onSendPrompt: (prompt: string) => void
	isLoading: boolean
	setChatHistory: React.Dispatch<React.SetStateAction<any[]>>
}) {
	const [inputValue, setInputValue] = useState('')
	const chatEndRef = React.useRef<HTMLDivElement>(null)
	const [ellipsis, setEllipsis] = React.useState('')

	// File upload state
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [filePreview, setFilePreview] = useState<string | null>(null)
	const [fileType, setFileType] = useState<string | null>(null)

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return
		setSelectedFile(file)
		setFileType(file.type)

		if (file.type.startsWith('image/')) {
			setFilePreview(URL.createObjectURL(file))
		} else if (file.type === 'text/plain') {
			const reader = new FileReader()
			reader.onload = () => setFilePreview(reader.result as string)
			reader.readAsText(file)
		} else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
			setFilePreview(file.name)
		} else if (
			file.type === 'application/msword' ||
			file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
			file.name.endsWith('.doc') ||
			file.name.endsWith('.docx')
		) {
			setFilePreview(file.name)
		}
	}

	const handleSendFile = async () => {
		if (!selectedFile) return
		let extractedText = ''

		if (selectedFile.type === 'text/plain') {
			extractedText = filePreview || ''
		} else if (selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf')) {
			// PDF extraction
			const arrayBuffer = await selectedFile.arrayBuffer()
			const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
			for (let i = 1; i <= pdf.numPages; i++) {
				const page = await pdf.getPage(i)
				const textContent = await page.getTextContent()
				extractedText += textContent.items.map((item: any) => item.str).join(' ') + '\n'
			}
		} else if (
			selectedFile.type === 'application/msword' ||
			selectedFile.type ===
				'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
			selectedFile.name.endsWith('.doc') ||
			selectedFile.name.endsWith('.docx')
		) {
			// Word extraction
			const arrayBuffer = await selectedFile.arrayBuffer()
			const result = await mammoth.extractRawText({ arrayBuffer })
			extractedText = result.value
		} else if (selectedFile.type.startsWith('image/')) {
			// OCR for images
			const {
				data: { text },
			} = await Tesseract.recognize(selectedFile, 'eng')
			extractedText = text
		}

		if (extractedText.trim()) {
			onSendPrompt(extractedText.trim())
		}

		setSelectedFile(null)
		setFilePreview(null)
		setFileType(null)
	}

	const handleSend = (e: React.FormEvent) => {
		e.preventDefault()
		if (selectedFile) {
			handleSendFile()
		} else if (inputValue.trim()) {
			onSendPrompt(inputValue)
			setInputValue('')
		}
	}

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
							{/* File preview for user-uploaded files */}
							{msg.fileName && (
								<div style={{ marginTop: 8 }}>
									<strong>{msg.fileName}</strong>
									{msg.fileType && msg.fileType.startsWith('image/') && msg.filePreview && (
										<div>
											<img
												src={msg.filePreview}
												alt={msg.fileName}
												style={{ maxWidth: 180, maxHeight: 120, borderRadius: 8, marginTop: 4 }}
											/>
										</div>
									)}
									{msg.fileType === 'text/plain' && msg.filePreview && (
										<pre
											style={{
												maxHeight: 80,
												overflow: 'auto',
												background: '#f7f7fb',
												borderRadius: 4,
												padding: 6,
												marginTop: 4,
											}}
										>
											{msg.filePreview.slice(0, 300)}
										</pre>
									)}
									{msg.fileType === 'application/pdf' && (
										<div style={{ fontStyle: 'italic', color: '#888', marginTop: 4 }}>
											[PDF file]
										</div>
									)}
									{(msg.fileType === 'application/msword' ||
										msg.fileType ===
											'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
										(msg.fileName &&
											(msg.fileName.endsWith('.doc') || msg.fileName.endsWith('.docx')))) && (
										<div style={{ fontStyle: 'italic', color: '#888', marginTop: 4 }}>
											[Word document]
										</div>
									)}
								</div>
							)}
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
				<form onSubmit={handleSend} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
					<label
						htmlFor="file-upload"
						style={{ cursor: 'pointer', marginRight: 8, fontSize: 20 }}
						title="Upload file"
					>
						📎
					</label>
					<input
						type="file"
						accept=".doc,.docx,.pdf,.txt,.jpg,.jpeg,.png"
						id="file-upload"
						style={{ display: 'none' }}
						onChange={handleFileChange}
					/>
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
				{/* File preview before sending */}
				{selectedFile && (
					<div style={{ marginTop: 8, background: '#f7f7fb', borderRadius: 8, padding: 10 }}>
						<strong>{selectedFile.name}</strong>
						{fileType && fileType.startsWith('image/') && filePreview && (
							<div>
								<img
									src={filePreview}
									alt={selectedFile.name}
									style={{ maxWidth: 180, maxHeight: 120, borderRadius: 8, marginTop: 4 }}
								/>
							</div>
						)}
						{fileType === 'text/plain' && filePreview && (
							<pre
								style={{
									maxHeight: 80,
									overflow: 'auto',
									background: '#fff',
									borderRadius: 4,
									padding: 6,
									marginTop: 4,
								}}
							>
								{filePreview.slice(0, 300)}
							</pre>
						)}
						{fileType === 'application/pdf' && (
							<div style={{ fontStyle: 'italic', color: '#888', marginTop: 4 }}>[PDF file]</div>
						)}
						{(fileType === 'application/msword' ||
							fileType ===
								'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
							(selectedFile &&
								(selectedFile.name.endsWith('.doc') || selectedFile.name.endsWith('.docx')))) && (
							<div style={{ fontStyle: 'italic', color: '#888', marginTop: 4 }}>
								[Word document]
							</div>
						)}
					</div>
				)}
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

// Helper: Find best matching tool for a step (refined semantic matching)
function findBestMatchingTool(step: string, toolRegistry: any) {
	const tools = toolRegistry.getAllTools ? toolRegistry.getAllTools() : []
	const stepLower = step.toLowerCase()

	// Text Analysis
	if (/analy[sz]e|analysis|statistics|count|summarize|extract/i.test(stepLower)) {
		if (/sentiment|emotion|opinion|positive|negative/i.test(stepLower)) {
			return tools.find((t: any) => t.name.toLowerCase().includes('sentiment'))
		}
		return tools.find((t: any) => t.name.toLowerCase().includes('analyzer'))
	}

	// Translation
	if (/translat|language|convert.*language/i.test(stepLower)) {
		return tools.find((t: any) => t.name.toLowerCase().includes('translator'))
	}

	// JSON
	if (/json|format|validate.*json/i.test(stepLower)) {
		return tools.find((t: any) => t.name.toLowerCase().includes('json'))
	}

	// Data Transformation
	if (/transform|convert|change.*format/i.test(stepLower)) {
		return tools.find((t: any) => t.name.toLowerCase().includes('transformer'))
	}

	// File Processing
	if (/file|document|process.*file/i.test(stepLower)) {
		return tools.find((t: any) => t.name.toLowerCase().includes('file processor'))
	}

	// Image Compression
	if (/image|photo|picture|compress|resize/i.test(stepLower)) {
		return tools.find((t: any) => t.name.toLowerCase().includes('image compressor'))
	}

	// AI/General Agent
	if (/ai|agent|generate|chat|answer|respond|deepseek/i.test(stepLower)) {
		return tools.find((t: any) => t.name.toLowerCase().includes('deepseek'))
	}

	// Fallback: DeepSeek AI Agent
	return tools.find((t: any) => t.name.toLowerCase().includes('deepseek'))
}

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

	// When steps change, clear and add input/tool nodes for all steps
	React.useEffect(() => {
		if (
			steps.length > 0 &&
			toolChainEditorRef.current &&
			toolChainEditorRef.current.addInputNodeForStep &&
			toolChainEditorRef.current.addToolNodeForStep &&
			toolChainEditorRef.current.addEdgeBetweenNodes
		) {
			clearWorkflow()
			steps.forEach((step: string, idx: number) => {
				const inputNodeId = toolChainEditorRef.current.addInputNodeForStep(step, idx)
				const bestTool = findBestMatchingTool(step, toolRegistry)
				if (bestTool) {
					const toolNodeId = toolChainEditorRef.current.addToolNodeForStep(bestTool, idx, step)
					// Connect input node to tool node
					if (inputNodeId && toolNodeId) {
						toolChainEditorRef.current.addEdgeBetweenNodes(inputNodeId, toolNodeId)
					}
				}
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
					setChatHistory={setChatHistory}
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
