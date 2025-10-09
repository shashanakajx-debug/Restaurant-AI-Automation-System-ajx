import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import AISession from '@/models/AISession';
import MenuItem from '@/models/MenuItem';
import { chatRequestSchema } from '@/schemas/ai';
import { withCorsAuthAndValidation, rateLimits } from '@/middleware';
import { createApiResponse, createApiError } from '@/lib/utils/api';
import AI from '@/lib/ai';

// POST /api/ai/chat - Chat with AI assistant
export const POST = withCorsAuthAndValidation(
  chatRequestSchema,
  { origin: true, methods: ['POST'], credentials: true }
)(
  rateLimits.ai(
    async (request: any) => {
      try {
        await dbConnect();
        // Ensure validated data exists (validation middleware should populate it)
        const { message, sessionId, context } = request.validatedData || {};
        const userId = request.user?.id;

        if (!message) {
          return NextResponse.json(createApiError('Message is required'), { status: 400 });
        }
        
        // Get or create AI session
        let session;
        if (sessionId) {
          session = await AISession.findOne({ sessionId, isActive: true });
        }
        
        if (!session) {
          session = new AISession({
            userId,
            context: context || { restaurantId: 'default' },
            messages: [],
            isActive: true,
          });
          await session.save();
        }
        
        // Get menu items for context
        const menuItems = await MenuItem.find({ active: true })
          .select('name description price category tags')
          .lean();
        
        // Build system prompt using shared helper
        const systemPrompt = AI.buildSystemPrompt(menuItems, session.context);

        // Add user message to session
        session.messages.push({
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          role: 'user',
          content: message,
          timestamp: new Date(),
        });
        
        // Get recent messages for context (last 10)
        const recentMessages = session.messages.slice(-10);
        
        // Prepare messages for OpenAI
        const messages = [
          { role: 'system', content: systemPrompt },
          ...recentMessages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        ];
        
        // Call AI wrapper
        const aiResponse = (await AI.chatWithAI({
          messages: messages as any,
          model: 'gpt-4o-mini',
          maxTokens: 500,
          temperature: 0.7,
        })) || 'I apologize, but I cannot provide a response at this time.';
        
        // Add AI response to session
        session.messages.push({
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date(),
        });
        
        // Save session
        await session.save();
        
        // Extract menu item recommendations from response (simple keyword matching)
        const recommendedItems = [];
        for (const item of menuItems) {
          if (aiResponse.toLowerCase().includes(item.name.toLowerCase())) {
            recommendedItems.push({
              menuItemId: item._id.toString(),
              name: item.name,
              description: item.description,
              price: item.price,
              imageUrl: item.imageUrl,
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
            intent: 'general', // Could be enhanced with intent detection
            confidence: 0.9,
          })
        );
      } catch (error) {
        console.error('[AI Chat API] Error:', error);
        return NextResponse.json(
          createApiError('Failed to process chat message'),
          { status: 500 }
        );
      }
    }
  )
);
