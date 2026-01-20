import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import hpp from 'hpp';
import { initializeDatabase } from './db/init.js';
import authRoutes from './routes/auth.js';
import companyRoutes from './routes/company.js';
import productsRoutes from './routes/products.js';
import customersRoutes from './routes/customers.js';
import salesRoutes from './routes/sales.js';
import invoicesRoutes from './routes/invoices.js';
import reportsRoutes from './routes/reports.js';
import usersRoutes from './routes/users.js';
import returnsRoutes from './routes/returns.js';
import backupRoutes from './routes/backup.js';
import expensesRoutes from './routes/expenses.js';
import superAdminRoutes from './routes/superAdmin.js';
import companyManagementRoutes from './routes/companyManagement.js';
import notificationRoutes from './routes/notifications.js';
import emailRoutes from './routes/email.js';
import announcementRoutes from './routes/announcements.js';
import supportTicketRoutes from './routes/supportTickets.js';
import platformSettingsRoutes from './routes/platformSettings.js';
import aiAnalyticsRoutes from './routes/aiAnalytics.js';
import documentProcessingRoutes from './routes/documentProcessing.js';
import analyticsRoutes from './routes/analytics.js';
import { errorHandler } from './middleware/errorHandler.js';
import { smartCompression, addCompressionStats } from './middleware/compressionMiddleware.js';
import { 
  strictAuthLimiter, 
  registrationLimiter,
  sanitizeInput,
  detectSuspiciousActivity,
  parameterPollutionProtection
} from './middleware/securityEnhancements.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9000;

// Trust proxy for accurate rate limiting behind reverse proxies (Render, etc.)
app.set('trust proxy', 1);

// 🛡️ Security Middleware - Keeping your data safe and sound!
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// 🚦 Smart Rate Limiting - Protecting our servers while keeping things speedy for you!
const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 1000, // 1000 requests per window for scalability
  message: 'Whoa there! 🐎 You\'re moving too fast! Please take a short break and try again in a moment.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.path === '/api/health' || req.path === '/api/wake' || req.path === '/api/ping';
  }
});

// 🔐 Login Security - We're keeping your account extra safe!
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts per window (reduced from 50 for better security)
  skipSuccessfulRequests: true, // Don't count successful logins
  message: 'Hold on! ✋ We noticed multiple login attempts. For your security, please wait a bit before trying again. 🔒',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', strictAuthLimiter); // Stricter rate limiting for login
app.use('/api/superadmin/login', strictAuthLimiter); // Stricter rate limiting for super admin
app.use('/api/auth/register', registrationLimiter); // Registration limiting
app.use('/api/company/register', registrationLimiter); // Company registration limiting

// Compression middleware for faster responses and reduced bandwidth
app.use(compression({
  level: 9, // Maximum compression (1-9, higher = better compression but slower)
  threshold: 512, // Compress responses larger than 512 bytes (was 1024)
  filter: (req, res) => {
    // Don't compress if client doesn't want it
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Always compress JSON responses
    const contentType = res.getHeader('Content-Type');
    if (contentType && contentType.includes('application/json')) {
      return true;
    }
    
    // Use default filter for other types
    return compression.filter(req, res);
  },
  // Memory level for compression (1-9, higher = more memory but better compression)
  memLevel: 9
}));

// Cache control middleware
app.use((req, res, next) => {
  // Don't cache API responses
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  // Cache static assets aggressively
  else if (req.path.startsWith('/uploads/')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  next();
});

// CORS Configuration - Allow all origins in development, specific in production
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:5100',
  'https://sap-business-management-system.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl, etc.)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins for easier testing
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // In production, check against allowed origins
    // Allow Vercel preview deployments (pattern: https://sap-business-management-system-*.vercel.app)
    const isVercelPreview = /^https:\/\/sap-business-management-system.*\.vercel\.app$/.test(origin);
    const isAllowedOrigin = allowedOrigins.some(allowedOrigin => origin.startsWith(allowedOrigin));
    
    if (isAllowedOrigin || isVercelPreview) {
      callback(null, true);
    } else {
      console.log(`⚠️ CORS blocked origin: ${origin}`);
      callback(null, false); // Block but don't throw error
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma', 'Expires', 'X-Request-ID', 'x-requested-with']
}));

// Body parser with size limits and error handling
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ error: 'Invalid JSON payload' });
      throw new Error('Invalid JSON');
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP Parameter Pollution protection
app.use(parameterPollutionProtection);

// Input sanitization middleware (XSS protection and SQL injection prevention)
app.use(sanitizeInput);

// Detect suspicious activity (SQL injection, XSS, path traversal attempts)
app.use(detectSuspiciousActivity);

// Smart compression middleware - monitors and optimizes response sizes
app.use(smartCompression({
  arrayThreshold: 10,
  sizeThreshold: 5000,
  enabled: true
}));

// Add compression statistics to response headers
app.use(addCompressionStats());

// Serve static files (profile pictures)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Initialize database and start server
async function initAndStart() {
  await initializeDatabase();

  // Health check route
  app.get('/', (req, res) => {
    res.json({ 
      status: 'ok', 
      message: 'SAP Business Management System API', 
      version: '2.0.0',
      timestamp: new Date().toISOString()
    });
  });

  // Health check for monitoring services
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  // Wake-up endpoint - keeps server alive on free tier
  app.get('/api/wake', (req, res) => {
    res.json({ 
      status: 'awake',
      message: 'Server is ready',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // Ping endpoint for automatic wake-up (no auth required)
  app.post('/api/ping', (req, res) => {
    res.json({ 
      status: 'pong',
      serverTime: new Date().toISOString()
    });
  });

  // Routes
  // Super Admin routes (independent from company auth)
  app.use('/api/superadmin', superAdminRoutes);
  app.use('/api/superadmin', companyManagementRoutes);
  app.use('/api/email', emailRoutes); // Email management for super admins
  app.use('/api/announcements', announcementRoutes); // Announcements system
  app.use('/api/support-tickets', supportTicketRoutes); // Support ticket system
  app.use('/api/platform-settings', platformSettingsRoutes); // Platform settings
  
  // Regular company routes
  app.use('/api/auth', authRoutes);
  app.use('/api/company', companyRoutes);
  app.use('/api/products', productsRoutes);
  app.use('/api/customers', customersRoutes);
  app.use('/api/sales', salesRoutes);
  app.use('/api/invoices', invoicesRoutes);
  app.use('/api/reports', reportsRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/returns', returnsRoutes);
  app.use('/api/backup', backupRoutes);
  app.use('/api/expenses', expensesRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/ai', aiAnalyticsRoutes); // AI-powered analytics and insights
  app.use('/api/documents', documentProcessingRoutes); // Document processing and OCR
  app.use('/api/analytics', analyticsRoutes); // Performance tracking and visitor analytics

  // Error handling
  app.use(errorHandler);

  // Start server with automatic port fallback
  startServer();
}

function startServer(port = PORT) {
  if (port > 9050) {
    console.error('❌ All ports in range are in use');
    process.exit(1);
  }
  
  server = app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Server running on:`);
    console.log(`   - Local:   http://localhost:${port}`);
    console.log(`   - Network: http://10.177.144.92:${port}`);
    console.log(`   - Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   - Node Version: ${process.version}`);
    console.log(`   - Memory: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} in use, trying ${port + 1}...`);
      if (server) server.close();
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
  
  // Set server timeout to handle long-running requests
  server.timeout = 120000; // 2 minutes
  server.keepAliveTimeout = 65000; // 65 seconds
  server.headersTimeout = 66000; // slightly higher than keepAliveTimeout
}

// Initialize and start
initAndStart().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
  console.error(reason?.stack || reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('[CRITICAL] Uncaught Exception:', error);
  console.error(error.stack);
});

// Handle process exit
process.on('exit', (code) => {
  console.log(`Process exiting with code ${code}`);
});

// Graceful shutdown handler
let server;

const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  if (server) {
    server.close(async () => {
      console.log('HTTP server closed');
      
      try {
        // Close database connections
        const { closeDatabase } = await import('./db/connection.js');
        await closeDatabase();
        console.log('Database connections closed');
        
        console.log('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    });
    
    // Force shutdown after 30 seconds
    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  } else {
    process.exit(0);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Memory monitoring for production (only warns above 500MB or 90% usage)
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    const memUsage = process.memoryUsage();
    const heapUsedMB = (memUsage.heapUsed / 1024 / 1024).toFixed(2);
    const heapTotalMB = (memUsage.heapTotal / 1024 / 1024).toFixed(2);
    const usagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    
    // Only warn if usage exceeds 500MB OR 90% of available heap
    if (memUsage.heapUsed > 500 * 1024 * 1024 || usagePercent > 90) {
      console.warn(`⚠️ High memory usage: ${heapUsedMB}MB / ${heapTotalMB}MB (${usagePercent.toFixed(1)}%)`);
    }
  }, 300000); // Check every 5 minutes (reduced frequency)
}

// Export app for AWS Lambda
export default app;
