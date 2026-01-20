import { query } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/ai/chat
 * Send message to AI chatbot and get response
 */
export async function chat(req, res) {
  try {
    const { message, conversation_id } = req.body;
    const companyId = req.companyId;
    const userId = req.user.id;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // For now, return a simple mock response
    // In production, this would call an actual AI service (OpenAI, etc.)
    const response = generateMockResponse(message);

    // Save conversation to database
    const conversationId = conversation_id || uuidv4();
    const now = new Date();

    // Save user message
    await query(
      `INSERT INTO chatbot_messages 
      (id, conversation_id, company_id, user_id, message, sender, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), conversationId, companyId, userId, message, 'user', now]
    );

    // Save bot response
    await query(
      `INSERT INTO chatbot_messages 
      (id, conversation_id, company_id, user_id, message, sender, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), conversationId, companyId, userId, response, 'bot', now]
    );

    res.json({
      success: true,
      conversation_id: conversationId,
      response
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
}

/**
 * GET /api/ai/conversations
 * Get user's conversation history
 */
export async function getConversations(req, res) {
  try {
    const companyId = req.companyId;
    const userId = req.user.id;

    const [messages] = await query(
      `SELECT * FROM chatbot_messages 
       WHERE company_id = ? AND user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 100`,
      [companyId, userId]
    );

    // Group by conversation
    const conversations = {};
    messages.forEach(msg => {
      if (!conversations[msg.conversation_id]) {
        conversations[msg.conversation_id] = [];
      }
      conversations[msg.conversation_id].push(msg);
    });

    res.json({
      success: true,
      conversations: Object.entries(conversations).map(([id, msgs]) => ({
        conversation_id: id,
        messages: msgs.reverse(), // Chronological order
        last_updated: msgs[0].created_at
      }))
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
}

// Helper function to generate mock AI responses
function generateMockResponse(message) {
  const lowercaseMsg = message.toLowerCase();

  if (lowercaseMsg.includes('sales') || lowercaseMsg.includes('revenue')) {
    return 'Based on your sales data, your revenue has been growing steadily. Consider focusing on your top-performing products to maximize profits.';
  } else if (lowercaseMsg.includes('inventory') || lowercaseMsg.includes('stock')) {
    return 'Your inventory levels look good overall. However, I noticed some products are running low. Would you like me to generate a reorder report?';
  } else if (lowercaseMsg.includes('customer') || lowercaseMsg.includes('client')) {
    return 'Your customer base is growing! I recommend implementing a loyalty program to increase retention rates.';
  } else if (lowercaseMsg.includes('product') || lowercaseMsg.includes('item')) {
    return 'Your product catalog is diverse. Consider analyzing which categories perform best and expanding those product lines.';
  } else if (lowercaseMsg.includes('hello') || lowercaseMsg.includes('hi')) {
    return 'Hello! I\'m your SAP business assistant. I can help you analyze sales data, manage inventory, understand customer behavior, and provide business insights. How can I help you today?';
  } else if (lowercaseMsg.includes('help')) {
    return 'I can assist you with:\n• Sales analysis and forecasting\n• Inventory management\n• Customer insights\n• Product recommendations\n• Business analytics\n\nWhat would you like to know?';
  } else {
    return 'Thank you for your message. I\'m here to help with your business analytics and management. Could you please provide more details about what you\'d like to know?';
  }
}
