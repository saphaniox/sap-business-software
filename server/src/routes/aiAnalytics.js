import express from 'express';
import {
  getSalesForecast,
  getInventoryRecommendations,
  getCustomerInsights,
  getFraudDetection
} from '../controllers/aiAnalyticsController.js';
import { chat } from '../controllers/aiChatbotController.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContext } from '../middleware/tenantContext.js';

const router = express.Router();

// Apply authentication and tenant context to all routes
router.use(authenticate);
router.use(tenantContext);

/**
 * @route   GET /api/ai/sales-forecast
 * @desc    Get AI-powered sales forecasting with predictions
 * @access  Private
 * @query   days - Number of days to forecast (default: 30)
 * @query   product_id - Optional product ID to forecast specific product
 */
router.get('/sales-forecast', getSalesForecast);

/**
 * @route   GET /api/ai/inventory-recommendations
 * @desc    Get smart inventory recommendations with reorder suggestions
 * @access  Private
 */
router.get('/inventory-recommendations', getInventoryRecommendations);

/**
 * @route   GET /api/ai/customer-insights
 * @desc    Get AI-powered customer insights and segmentation
 * @access  Private
 */
router.get('/customer-insights', getCustomerInsights);

/**
 * @route   GET /api/ai/fraud-detection
 * @desc    Detect fraudulent transactions and security threats
 * @access  Private (Admin only)
 */
router.get('/fraud-detection', getFraudDetection);

/**
 * @route   POST /api/ai/chat
 * @desc    AI Chatbot Assistant - Process natural language queries
 * @access  Private
 * @body    query - User's question in natural language
 */
router.post('/chat', chat);

export default router;
