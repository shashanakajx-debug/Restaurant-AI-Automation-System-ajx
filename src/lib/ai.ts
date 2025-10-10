import OpenAI from 'openai';

export type ChatMessage = { 
  role: 'system' | 'user' | 'assistant'; 
  content: string;
  name?: string;
};

/**
 * Get OpenAI client with proper error handling
 */
function getOpenAIClient() {
  // Support both OPENAI_API_KEY and a generic LLM_API_KEY fallback
  const apiKey = process.env.OPENAI_API_KEY || process.env.LLM_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY / LLM_API_KEY is not configured in environment');
    throw new Error('OpenAI API key is missing. Please check your environment configuration.');
  }

  if (!process.env.OPENAI_API_KEY && process.env.LLM_API_KEY) {
    console.warn('Using LLM_API_KEY as fallback for OpenAI client. Consider renaming to OPENAI_API_KEY for clarity.');
  }

  try {
    return new OpenAI({ apiKey });
  } catch (error) {
    console.error('Failed to initialize OpenAI client:', error);
    throw new Error('Failed to initialize AI service. Please try again later.');
  }
}

/**
 * Enhanced chat function with better error handling and typing
 * Default temperature is low to encourage consistent answers.
 */
export async function chatWithAI({
  messages,
  model = 'gpt-4o-mini',
  maxTokens = 800,
  temperature = 0.0,
  retries = 2,
}: {
  messages: ChatMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
  retries?: number;
}): Promise<string | null> {
  let attempts = 0;
  let lastError: Error | null = null;

  while (attempts <= retries) {
    try {
      const client = getOpenAIClient();

      console.log(`[AI Chat] Sending request to OpenAI with ${messages.length} messages (model=${model}, temp=${temperature})`);

      // Use the Chat Completions API shape expected by openai v4
      const resp = await client.chat.completions.create({
        model,
        messages: messages as any,
        max_tokens: maxTokens,
        temperature,
      });

      // Response parsing: older/newer SDKs may return different shapes; handle common ones
      const content = (resp as any)?.choices?.[0]?.message?.content || (resp as any)?.choices?.[0]?.text || null;

      if (!content) {
        console.warn('[AI Chat] Received empty response from OpenAI');
      } else {
        console.log(`[AI Chat] Received response of length ${content.length}`);
      }

      return content || null;
    } catch (error: any) {
      lastError = error;
      console.error(`[AI Chat] Attempt ${attempts + 1}/${retries + 1} failed:`, error?.message || error);
      attempts++;

      // Wait before retrying (exponential backoff)
      if (attempts <= retries) {
        const delay = Math.pow(2, attempts) * 500; // 1s, 2s, 4s...
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // All retries failed - return null so caller can fallback gracefully
  console.error('[AI Chat] All attempts failed:', lastError);
  return null;
}

export function buildSystemPrompt(menuItems: any[], sessionContext: any = {}) {
  const ctx = sessionContext || {};
  return `You are an AI assistant for a restaurant. Help customers with menu recommendations, order assistance, and general questions.\n\nAvailable menu items:\n${menuItems
    .map(
      (item) =>
        `- ${item.name}: ${item.description || 'No description'} ($${item.price}) [${item.category}] ${
          item.tags?.length ? `Tags: ${item.tags.join(', ')}` : ''
        }`
    )
    .join('\n')}\n\nCurrent context:\n- Restaurant ID: ${ctx.restaurantId || 'unknown'}\n- Current order: ${ctx.currentOrder?.join(', ') || 'None'}\n- Preferences: ${ctx.preferences?.join(', ') || 'None'}\n- Dietary restrictions: ${ctx.dietaryRestrictions?.join(', ') || 'None'}\n- Budget: ${ctx.budget ? `$${ctx.budget}` : 'No limit'}\n- Party size: ${ctx.partySize || 1}\n\nGuidelines:\n1. Be helpful, friendly, and professional\n2. Provide specific menu recommendations when asked\n3. Consider dietary restrictions and preferences\n4. Suggest items within budget if specified\n5. Ask clarifying questions when needed\n6. Keep responses concise but informative\n7. If asked about items not on the menu, politely explain they're not available\n\nRespond in a conversational, helpful manner.`;
}

export default {
  chatWithAI,
  buildSystemPrompt,
};
