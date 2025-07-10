// utils/llmClient.ts

type Provider = 'openai' | 'deepseek'

interface LLMOptions {
	provider: Provider
	apiKey: string
	model?: string
	systemPrompt?: string
	maxTokens?: number
	temperature?: number
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
