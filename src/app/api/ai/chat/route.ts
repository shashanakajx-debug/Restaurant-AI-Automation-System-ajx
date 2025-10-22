import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import dbConnect from '@/lib/mongoose';
import AISession from '@/models/AISession';
import MenuItem from '@/models/MenuItem';
import { chatRequestSchema } from '@/schemas/ai';
import { withCorsAuthAndValidation, rateLimits } from '@/middleware';
import { createApiResponse, createApiError } from '@/lib/utils/api';
import * as AI from '@/lib/ai';

type ValidatedData = {
  message: string;
  sessionId?: string;
  context?: Record<string, any>;
};

const MAX_MESSAGE_LENGTH = 4000;
const MAX_STORED_MESSAGES = 50;
const RECENT_CONTEXT_MESSAGES = 10;

// Helper function to ensure messages is an array
function ensureMessagesArray(doc: any) {
  if (!doc) return;
  if (!Array.isArray(doc.messages)) {
    if (doc.messages && typeof doc.messages === 'object') {
      // try convert map/object -> array
      try {
        doc.messages = Object.values(doc.messages);
      } catch {
        doc.messages = [];
      }
    } else {
      doc.messages = [];
    }
    if (typeof doc.markModified === 'function') doc.markModified('messages');
  }
}

// Helper function to normalize AI response
function normalizeAiResponse(response: string | null): string {
  if (!response) return '';
  return response.trim();
}

// Helper function to escape regex special characters
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const POST = withCorsAuthAndValidation(
  chatRequestSchema,
  { origin: true, methods: ['POST'], credentials: false }
)(
  rateLimits.general(async (request: NextRequest) => {
    try {
      await dbConnect();
      
      // Get validated data from middleware
      const { message, sessionId, context = {} } = (request as any).validatedData as ValidatedData;
      
      if (!message || message.length > MAX_MESSAGE_LENGTH) {
        return NextResponse.json(
          createApiError('Message is required and cannot exceed 4000 characters'),
          { status: 400 }
        );
      }

      // Get restaurant ID from context or use default
      const restaurantId = context.restaurantId || process.env.DEFAULT_RESTAURANT_ID || 'default';
      
      // Find or create session
      let session;
      if (sessionId) {
        session = await AISession.findOne({ sessionId });
      }
      
      if (!session) {
        // Create new session
        session = new AISession({
          sessionId: `ai_${Date.now()}_${randomUUID()}`,
          messages: [],
          context: {
            restaurantId,
            ...context
          },
          isActive: true
        });
      }
      
      // ensure session has context
      session.context = session.context || { restaurantId: process.env.DEFAULT_RESTAURANT_ID || 'default' };
      // ensure messages array helper (model also defends)
      if (!Array.isArray(session.messages)) session.messages = Array.isArray(session.messages ? Object.values(session.messages) : []) ? Object.values(session.messages) : [];

      // Helper: escape special characters in regex
      function escapeRegExp(string: string) {
        return string.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
      }
      
      // DEBUG logs: helps track shape if error occurs (you can remove later)
  const logger = require('@/lib/logger').default;
  logger.debug('[AI Chat] session.constructor.name =', session?.constructor?.name);
  logger.debug('[AI Chat] messages isArray =', Array.isArray(session?.messages), 'len =', session?.messages?.length ?? 'n/a');
  logger.debug('[AI Chat] hasSaveMethod =', typeof session?.save === 'function');

  // Ensure messages is an array before pushing
  if (!Array.isArray(session.messages)) session.messages = [];
      const userMsgObj = {
        id: `msg_${Date.now()}_${randomUUID()}`,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };

      // push user message
      (session as any).messages.push(userMsgObj);

      // Keep only a bounded number of stored messages to avoid DB bloat
      if ((session as any).messages.length > MAX_STORED_MESSAGES) {
        session.messages = (session as any).messages.slice(-MAX_STORED_MESSAGES);
      }

      if (typeof session.markModified === 'function') session.markModified('messages');

      // Fetch contextual menu items
      const menuItems = await MenuItem.find({ active: true })
        .select('name description price category tags imageUrl')
        .lean();

      // Build system prompt using helper (ensure it exists)
      const systemPrompt = AI.buildSystemPrompt
        ? AI.buildSystemPrompt(menuItems, session.context)
        : `You are an assistant for a restaurant. Use available menu data to answer user queries.`;

      // Prepare recent messages for model context
      const recentMessages = (session.messages || []).slice(-RECENT_CONTEXT_MESSAGES);
      const messagesForModel = [
        { role: 'system', content: systemPrompt },
        ...recentMessages.map((m: any) => ({ role: m.role, content: m.content })),
      ];

      // Call AI wrapper with improved error handling
      let rawAiResp;
      try {
  logger.info('[AI Chat] Sending request to AI with messages count=', messagesForModel.length);
  rawAiResp = await AI.chatWithAI({
          messages: messagesForModel as any,
          model: 'gpt-4o-mini',
          maxTokens: 800,
          // use lower temperature by default for consistent answers; lib default is 0.0
        });
  logger.info('[AI Chat] Received response from AI (truncated):', typeof rawAiResp === 'string' ? rawAiResp.substring(0, 100) : rawAiResp);
      } catch (aiErr) {
  logger.error('[AI Chat] AI service error:', aiErr);
        rawAiResp = null;
      }

      const aiResponse = normalizeAiResponse(rawAiResp) || 'I apologize, but I cannot provide a response at this time.';

      // Add assistant reply to session
      const assistantMsgObj = {
        id: `msg_${Date.now()}_${randomUUID()}`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
      };

      // push assistant message
      (session as any).messages.push(assistantMsgObj);

      if ((session as any).messages.length > MAX_STORED_MESSAGES) {
        session.messages = (session as any).messages.slice(-MAX_STORED_MESSAGES);
      }

  if (typeof session.markModified === 'function') session.markModified('messages');

      // Save session
      try {
        await session.save();
      } catch (saveErr) {
  logger.error('[AI Chat] Failed to save session:', saveErr);
        // continue: still return AI response to user, but log DB error
      }

      // Recommendation extraction (word-boundary match to reduce false matches)
      const recommendedItems: Array<any> = [];
      for (const item of menuItems || []) {
        if (!item?.name) continue;
        const nameSafe = item.name.toString().trim();
        const re = new RegExp(`\\b${escapeRegExp(nameSafe)}\\b`, 'i');
        if (re.test(aiResponse)) {
          recommendedItems.push({
            menuItemId: item._id?.toString?.() ?? null,
            name: item.name,
            description: item.description ?? '',
            price: item.price ?? null,
            imageUrl: item.imageUrl ?? null,
            confidence: 0.8,
            reasons: ['Mentioned in conversation'],
          });
        }
      }

      return NextResponse.json(
        createApiResponse({
          message: aiResponse,
          recommendations: recommendedItems,
          sessionId: session.sessionId,
          intent: 'general',
          confidence: 0.9,
        })
      );
    } catch (error) {
      console.error('[AI Chat API] Unhandled Error:', error);
      return NextResponse.json(createApiError('Failed to process chat message'), { status: 500 });
    }
  })
);
