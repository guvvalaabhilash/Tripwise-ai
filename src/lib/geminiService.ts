/**
 * geminiService.ts
 *
 * Uses the new @google/genai SDK (v2+) which targets the stable v1 endpoint.
 * The old @google/generative-ai SDK (v0.x) used the deprecated v1beta endpoint
 * where models like gemini-1.5-flash have been removed.
 *
 * Model: gemini-2.0-flash — current recommended model, available on v1 endpoint.
 */
import { GoogleGenAI, type Chat } from '@google/genai'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string

// ── System instruction — tells Gemini its persona and domain ────────────────
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

// Lazy-initialised client — created once on first use
let client: GoogleGenAI | null = null

function getClient(): GoogleGenAI {
  if (!client) {
    if (!API_KEY) throw new Error('VITE_GEMINI_API_KEY is not set in your .env file.')
    client = new GoogleGenAI({ apiKey: API_KEY })
  }
  return client
}

// ── Create a new multi-turn chat session ────────────────────────────────────
// Each call returns a fresh Chat object that tracks its own history.
export function createChatSession(): Chat {
  return getClient().chats.create({
    model: 'gemini-2.0-flash',
    config: {
      systemInstruction: SYSTEM_PROMPT,
      maxOutputTokens: 1024,
      temperature: 0.7,
    },
  })
}

// ── Send a message in an existing session and return the text response ───────
export async function sendChatMessage(chat: Chat, message: string): Promise<string> {
  const response = await chat.sendMessage({ message })
  return response.text ?? ''
}
