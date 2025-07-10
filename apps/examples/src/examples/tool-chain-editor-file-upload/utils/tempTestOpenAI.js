// tempTestOpenAI.js

const fetch = require('node-fetch'); // install this if not using Node 18+

async function testCall() {
	const response = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer YOUR_API_KEY`, // replace with your OpenAI API key
		},
		body: JSON.stringify({
			model: 'gpt-4o', // or 'gpt-3.5-turbo'
			messages: [
				{ role: 'system', content: 'You are a helpful assistant.' },
				{ role: 'user', content: 'What is 2 + 2?' },
			],
			max_tokens: 100,
		}),
	});

	if (!response.ok) {
		const error = await response.text();
		console.error(`API Error: ${response.status} ${response.statusText}\n${error}`);
		return;
	}

	const data = await response.json();
	console.log(`OpenAI says: ${data.choices[0].message.content}`);
}

testCall();
