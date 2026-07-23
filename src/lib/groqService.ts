/**
 * groqService.ts
 *
 * Calls the Groq API directly via fetch (no SDK) to avoid browser-environment
 * issues with the groq-sdk package making GET instead of POST requests.
 *
 * Model: llama-3.3-70b-versatile
 * Free tier: 14,400 req/day, 500,000 tokens/min
 *
 * Get your free API key at: https://console.groq.com/keys
 * Add it to .env as:  VITE_GROQ_API_KEY=gsk_...
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

// ── System prompt — defines the AI persona ──────────────────────────────────
const SYSTEM_PROMPT = `You are TripWise AI, an expert travel planning assistant built into the TripWise app.

Your expertise covers:
- Personalized trip itinerary planning (day-by-day schedules, activities, timings)
- Budget estimation and expense breakdowns (accommodation, food, transport, activities)
- Destination insights (best time to visit, local culture, must-see spots)
- Travel logistics (flights, trains, local transport, visa requirements for Indian travelers)
- Packing suggestions based on weather and trip type
- Group travel coordination and expense splitting advice
- Safety tips and travel advisories

Guidelines:
- Be conversational, helpful, and concise. Use bullet points and structure where useful.
- Use ₹ (Indian Rupees) as the default currency unless the user specifies otherwise.
- When planning trips, always include a day-by-day breakdown if asked.
- Proactively ask clarifying questions (budget range, travel dates, group size, preferences) if the user's request is vague.
- Suggest using TripWise features like the Expenses tracker, Split page, or Trip Planner when relevant.
- Keep responses focused on travel; politely redirect off-topic questions back to trip planning.`

// ── Message type ─────────────────────────────────────────────────────────────
export interface GroqMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

/**
 * Send a message to Groq and return the assistant's reply.
 * Pass the full conversation history so the model has context.
 */
export async function sendGroqMessage(history: GroqMessage[], userMessage: string): Promise<string> {
  const API_KEY = import.meta.env.VITE_GROQ_API_KEY as string

  if (!API_KEY || API_KEY === 'your_groq_api_key_here') {
    throw new Error(
      'VITE_GROQ_API_KEY is not set. Get a free key at https://console.groq.com/keys and add it to your .env file.',
    )
  }

  const messages: GroqMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history,
    { role: 'user', content: userMessage },
  ]

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    }),
  })

  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`Groq API error ${res.status}: ${errBody}`)
  }

  const data = await res.json()
  return (data.choices?.[0]?.message?.content as string) ?? ''
}
