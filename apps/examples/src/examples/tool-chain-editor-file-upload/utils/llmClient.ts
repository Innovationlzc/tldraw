// utils/llmClient.ts

type Provider = 'openai' | 'deepseek'

// interface LLMOptions {
// 	provider: Provider
// 	apiKey: string
// 	model?: string
// 	systemPrompt?: string
// 	maxTokens?: number
// 	temperature?: number
// }

export interface LLMOptions {
	provider: 'openai' | 'deepseek'
	apiKey: string
	model?: string
	systemPrompt?: string
	maxTokens?: number
	temperature?: number
	file?: File
}

export async function callLLMUnified(question: string, options: LLMOptions): Promise<string> {
	const {
		provider,
		apiKey,
		model = provider === 'openai' ? 'gpt-4o' : 'deepseek-chat',
		systemPrompt = `You are a helpful AI assistant. Please provide clear, concise, and accurate answers.`,
		maxTokens = 256,
		temperature = 0.7,
		file,
	} = options

	// If we have an image file and it's an OpenAI model, call vision API
	if (file && provider === 'openai' && file.type.startsWith('image/')) {
		const imageBase64Url = await convertToDataUrl(file)

		return callOpenAIVision({
			apiKey: apiKey,
			imageBase64Url,
			textPrompt: question,
			model,
		})
	}

	// Otherwise fallback to text-based LLM call
	
		return callLLM(question, {
		provider: provider, // 'openai' or 'deepseek'
		apiKey: apiKey,
		})
	}


// Helper for reading base64 data URL from File
export function convertToDataUrl(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => resolve(reader.result as string)
		reader.onerror = reject
		reader.readAsDataURL(file)
	})
}

export async function callLLM(question: string, options: LLMOptions): Promise<string> {
	const {
		provider,
		apiKey,
		model = provider === 'openai' ? 'gpt-4o' : 'deepseek-chat',
		systemPrompt = `You are a helpful AI assistant. Please provide clear, concise, and accurate answers.`,
		maxTokens = 256,
		temperature = 0.7,
	} = options

	const userPrompt = `User Query: ${question}\n\nPlease provide a helpful response:`

	const url =
		provider === 'openai'
			? 'https://api.openai.com/v1/chat/completions'
			: 'https://api.deepseek.com/v1/chat/completions'

	const headers = {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${apiKey}`,
	}

	const body = {
		model,
		messages: [
			{ role: 'system', content: systemPrompt },
			{ role: 'user', content: userPrompt },
		],
		max_tokens: maxTokens,
		temperature,
	}

	const response = await fetch(url, {
		method: 'POST',
		headers,
		body: JSON.stringify(body),
	})

	if (!response.ok) {
		const errorText = await response.text()
		throw new Error(`LLM API error: ${response.status} - ${errorText}`)
	}

	const data = await response.json()
	return data.choices?.[0]?.message?.content?.trim() || 'No response.'
}



export async function callOpenAIVision({
	apiKey,
	imageBase64Url,
	textPrompt,
	model = 'gpt-4o',
}: {
	apiKey: string
	imageBase64Url: string // "data:image/png;base64,..."
	textPrompt: string
	model?: string
}): Promise<string> {
	const url = 'https://api.openai.com/v1/chat/completions'

	const headers = {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${apiKey}`,
	}

	const body = {
		model,
		messages: [
			{
				role: 'user',
				content: [
					{ type: 'text', text: textPrompt || 'Please analyze this image.' },
					{ type: 'image_url', image_url: { url: imageBase64Url } },
				],
			},
		],
		max_tokens: 256,
		temperature: 0.7,
	}

	const response = await fetch(url, {
		method: 'POST',
		headers,
		body: JSON.stringify(body),
	})

	if (!response.ok) {
		const errorText = await response.text()
		console.error('Vision API error:', response.status, errorText)
		throw new Error('OpenAI Vision API request failed')
	}

	const data = await response.json()
	return data.choices?.[0]?.message?.content?.trim() || 'No response'
}
