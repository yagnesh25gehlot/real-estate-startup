"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const client_1 = require("@prisma/client");
const routes_1 = __importDefault(require("./modules/auth/routes"));
const routes_2 = __importDefault(require("./modules/properties/routes"));
const routes_3 = __importDefault(require("./modules/booking/routes"));
const routes_4 = __importDefault(require("./modules/commission/routes"));
const routes_5 = __importDefault(require("./modules/admin/routes"));
const routes_6 = __importDefault(require("./modules/notification/routes"));
const errorHandler_1 = require("./utils/errorHandler");
const service_1 = require("./modules/booking/service");
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || 3001;
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            fontSrc: ["'self'", "https:", "data:"],
            connectSrc: ["'self'"],
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
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL || 'https://yourdomain.com'].filter(Boolean)
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:5175', 'http://127.0.0.1:5176', null];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin) {
            console.log('CORS: Allowing request with no origin');
            return callback(null, true);
        }
        console.log('CORS: Checking origin:', origin);
        if (allowedOrigins.indexOf(origin) !== -1) {
            console.log('CORS: Origin allowed');
            callback(null, true);
        }
        else {
            console.log('CORS: Origin not allowed');
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-User-Email'],
    exposedHeaders: ['X-Total-Count'],
    maxAge: 86400,
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 100 : 5000,
    message: { error: 'Too many requests from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
});
app.use('/api/', limiter);
app.use(express_1.default.json({
    limit: '10mb'
}));
app.use(express_1.default.urlencoded({
    extended: true,
    limit: '10mb',
    parameterLimit: 1000
}));
app.use('/uploads', (req, res, next) => {
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    }
    else {
        next();
    }
}, express_1.default.static(path_1.default.join(__dirname, '../uploads'), {
    setHeaders: (res, filePath) => {
        res.set('X-Content-Type-Options', 'nosniff');
        res.set('X-Frame-Options', 'DENY');
        res.set('X-XSS-Protection', '1; mode=block');
        if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || filePath.endsWith('.png') || filePath.endsWith('.gif') || filePath.endsWith('.svg')) {
            res.set('Cross-Origin-Resource-Policy', 'cross-origin');
            res.set('Cache-Control', 'public, max-age=31536000');
        }
        else {
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
    },
    dotfiles: 'deny',
    etag: true,
    lastModified: true,
    maxAge: 0
}));
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});
app.use('/api/auth', routes_1.default);
app.use('/api/properties', routes_2.default);
app.use('/api/bookings', routes_3.default);
app.use('/api/dealers', routes_4.default);
app.use('/api/admin', routes_5.default);
app.use('/api/notifications', routes_6.default);
if (process.env.NODE_ENV === 'production') {
    app.use(express_1.default.static(path_1.default.join(__dirname, '../../frontend/dist')));
    app.get('*', (req, res) => {
        if (req.path.startsWith('/api/')) {
            return res.status(404).json({ error: 'API route not found' });
        }
        res.sendFile(path_1.default.join(__dirname, '../../frontend/dist/index.html'));
    });
}
app.use(errorHandler_1.errorHandler);
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found'
    });
});
process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
app.listen(PORT, () => {
    if (process.env.NODE_ENV !== 'production') {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV}`);
        console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    }
});
const checkExpiredBookings = async () => {
    try {
        if (process.env.NODE_ENV !== 'production') {
            console.log('🕐 Checking for expired bookings...');
        }
        await service_1.BookingService.updateExpiredBookings();
        if (process.env.NODE_ENV !== 'production') {
            console.log('✅ Expired bookings check completed');
        }
    }
    catch (error) {
        console.error('❌ Error checking expired bookings:', error);
    }
};
const EXPIRED_BOOKINGS_CHECK_INTERVAL = 60 * 60 * 1000;
setInterval(checkExpiredBookings, EXPIRED_BOOKINGS_CHECK_INTERVAL);
setTimeout(checkExpiredBookings, 5 * 60 * 1000);
if (process.env.NODE_ENV !== 'production') {
    console.log(`⏰ Scheduled task: Checking expired bookings every ${EXPIRED_BOOKINGS_CHECK_INTERVAL / (60 * 1000)} minutes`);
}
exports.default = app;
//# sourceMappingURL=index.js.map