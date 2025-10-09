import OpenAI from 'openai';

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured in environment');
  }

  return new OpenAI({ apiKey });
}

export async function chatWithAI({
  messages,
  model = 'gpt-4o-mini',
  maxTokens = 500,
  temperature = 0.7,
}: {
  messages: ChatMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
}) {
  const client = getOpenAIClient();

  const resp = await client.chat.completions.create({
    model,
    messages: messages as any,
    max_tokens: maxTokens,
    temperature,
  });

  const content = resp.choices?.[0]?.message?.content;
  return content || null;
}

export function buildSystemPrompt(menuItems: any[], sessionContext: any) {
  return `You are an AI assistant for a restaurant. Help customers with menu recommendations, order assistance, and general questions.\n\nAvailable menu items:\n${menuItems
    .map(
      (item) =>
        `- ${item.name}: ${item.description || 'No description'} ($${item.price}) [${item.category}] ${
          item.tags?.length ? `Tags: ${item.tags.join(', ')}` : ''
        }`
    )
    .join('\n')}\n\nCurrent context:\n- Restaurant ID: ${sessionContext.restaurantId}\n- Current order: ${sessionContext.currentOrder?.join(', ') || 'None'}\n- Preferences: ${sessionContext.preferences?.join(', ') || 'None'}\n- Dietary restrictions: ${sessionContext.dietaryRestrictions?.join(', ') || 'None'}\n- Budget: ${sessionContext.budget ? `$${sessionContext.budget}` : 'No limit'}\n- Party size: ${sessionContext.partySize || 1}\n\nGuidelines:\n1. Be helpful, friendly, and professional\n2. Provide specific menu recommendations when asked\n3. Consider dietary restrictions and preferences\n4. Suggest items within budget if specified\n5. Ask clarifying questions when needed\n6. Keep responses concise but informative\n7. If asked about items not on the menu, politely explain they're not available\n\nRespond in a conversational, helpful manner.`;
}

export default {
  chatWithAI,
  buildSystemPrompt,
};
