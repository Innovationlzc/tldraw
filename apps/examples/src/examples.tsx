import { ComponentType } from 'react'

export interface Example {
	title: string
	description: string
	details: string
	path: string
	codeUrl: string
	hide: boolean
	category: Category
	priority: number
	componentFile: string
	keywords: string[]
	multiplayer: boolean
	loadComponent(): Promise<ComponentType<{ roomId?: string }>>
}

type Category =
	| 'getting-started'
	| 'configuration'
	| 'editor-api'
	| 'ui'
	| 'layout'
	| 'events'
	| 'shapes/tools'
	| 'collaboration'
	| 'data/assets'
	| 'use-cases'

const getExamplesForCategory = (category: Category) =>
	(Object.values(import.meta.glob('./examples/*/README.md', { eager: true })) as Example[])
		.filter((e) => e.category === category)
		.sort((a, b) => {
			if (a.priority === b.priority) return a.title.localeCompare(b.title)
			return a.priority - b.priority
		})

// 新增 Tool Chain Editor 示例
const toolChainEditorExample: Example = {
	title: 'Tool Chain Editor (自动生成&交互)',
	description: '自动生成和交互式编辑 AI agent 工具链的 UI 示例',
	details: '演示如何根据 LLM 返回的工具链数据自动生成交互式流程图，并支持用户拖拽、编辑。',
	path: '/tool-chain-editor',
	codeUrl: 'https://github.com/tldraw/tldraw',
	hide: false,
	category: 'ui',
	priority: 0,
	componentFile: './examples/tool-chain-editor/ToolChainEditorExample.tsx',
	keywords: ['tool chain', 'AI agent', 'react-flow'],
	multiplayer: false,
	loadComponent: () =>
		import('./examples/tool-chain-editor/ToolChainEditorExample').then((m) => m.default),
}

const categories = [
	['getting-started', 'Getting started'],
	['configuration', 'Configuration'],
	['editor-api', 'Editor API'],
	['ui', 'UI & theming'],
	['layout', 'Page layout'],
	['events', 'Events & effects'],
	['shapes/tools', 'Shapes & tools'],
	['collaboration', 'Collaboration'],
	['data/assets', 'Data & assets'],
	['use-cases', 'Use cases'],
]

export const examples = categories.map(([category, title]) => ({
	id: title,
	value: [
		...(category === 'ui' ? [toolChainEditorExample] : []),
		...getExamplesForCategory(category as Category),
	],
}))
