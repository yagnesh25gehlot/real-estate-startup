import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';

// Import routes
import authRoutes from './modules/auth/routes';
import propertyRoutes from './modules/properties/routes';
import bookingRoutes from './modules/booking/routes';
import dealerRoutes from './modules/commission/routes';
import adminRoutes from './modules/admin/routes';
import notificationRoutes from './modules/notification/routes';

// Import middleware
import { errorHandler } from './utils/errorHandler';
import { authMiddleware } from './modules/auth/middleware';
import { BookingService } from './modules/booking/service';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Trust Railway proxy
app.set('trust proxy', 1);

// Enhanced security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "blob:", "http://localhost:3001", "http://localhost:5173"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https:", "data:", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://real-estate-startup-production.up.railway.app"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  frameguard: { action: 'deny' },
  xssFilter: true,
  hidePoweredBy: true,
}));

// Secure CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.FRONTEND_URL || 'https://real-estate-startup-production.up.railway.app'].filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:5175', 'http://127.0.0.1:5176', null];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl requests, or file:// protocol)
    if (!origin) {
      console.log('CORS: Allowing request with no origin');
      return callback(null, true);
    }
    
    console.log('CORS: Checking origin:', origin);
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('CORS: Origin allowed');
      callback(null, true);
    } else {
      console.log('CORS: Origin not allowed');
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-User-Email'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400, // 24 hours
}));

// Rate limiting (reduced for development)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 5000, // limit each IP to 100 requests per windowMs in production, 5000 in development
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  keyGenerator: (req) => {
    // Use X-Forwarded-For header if available (Railway proxy)
    return req.headers['x-forwarded-for'] as string || req.ip;
  },
});

// Apply rate limiting to all routes
app.use('/api/', limiter);

// Stricter rate limiting for auth routes (temporarily disabled for development)
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5, // limit each IP to 5 requests per windowMs
//   message: { error: 'Too many authentication attempts, please try again later.' },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// app.use('/api/auth', authLimiter);

// Body parsing middleware with size limits
app.use(express.json({ 
  limit: '10mb'
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 1000
}));

// Serve static files with security headers
app.use('/uploads', (req, res, next) => {
  // Security headers for file uploads
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  
  // CORS headers for uploads
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
}, express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, filePath) => {
    // Security headers for static files
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');
    res.set('X-XSS-Protection', '1; mode=block');
    
    // Allow cross-origin access for images
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || filePath.endsWith('.png') || filePath.endsWith('.gif') || filePath.endsWith('.svg')) {
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
      res.set('Cache-Control', 'public, max-age=31536000'); // 1 year for images
    } else {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  },
  dotfiles: 'deny',
  etag: true,
  lastModified: true,
  maxAge: 0
}));

// Health check endpoint (minimal information)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint for Railway
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/dealers', dealerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
  
  // Handle client-side routing
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
}

// Error handling middleware
app.use(errorHandler);

// 404 handler (no path disclosure)
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found'
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  // Minimal logging in production
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  }
});

// Scheduled task to check for expired bookings
const checkExpiredBookings = async () => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('🕐 Checking for expired bookings...');
    }
    await BookingService.updateExpiredBookings();
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ Expired bookings check completed');
    }
  } catch (error) {
    console.error('❌ Error checking expired bookings:', error);
  }
};

// Run expired bookings check every hour (3600000 ms)
const EXPIRED_BOOKINGS_CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour

// Start the scheduled task
setInterval(checkExpiredBookings, EXPIRED_BOOKINGS_CHECK_INTERVAL);

// Run initial check after 5 minutes to avoid running immediately on startup
setTimeout(checkExpiredBookings, 5 * 60 * 1000);

if (process.env.NODE_ENV !== 'production') {
  console.log(`⏰ Scheduled task: Checking expired bookings every ${EXPIRED_BOOKINGS_CHECK_INTERVAL / (60 * 1000)} minutes`);
}

export default app; 