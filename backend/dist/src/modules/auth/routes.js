"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const express_validator_1 = require("express-validator");
const service_1 = require("./service");
const middleware_1 = require("./middleware");
const upload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/profiles/');
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + '-' + file.originalname);
        },
    }),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed for profile pictures'));
        }
    },
});
const aadhaarUpload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/aadhaar/');
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + '-' + file.originalname);
        },
    }),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed for aadhaar images'));
        }
    },
});
const router = express_1.default.Router();
router.post('/google', async (req, res, next) => {
    try {
        const { email, name, picture, role } = req.body;
        if (!email || !name) {
            return res.status(400).json({
                success: false,
                error: 'Email and name are required',
            });
        }
        const result = await service_1.AuthService.googleAuth({
            email,
            name,
            picture,
            role,
        });
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/signup', aadhaarUpload.single('aadhaarImage'), [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('name').trim().isLength({ min: 2 }),
    (0, express_validator_1.body)('password').isLength({ min: 8 }),
    (0, express_validator_1.body)('mobile').optional().isString(),
    (0, express_validator_1.body)('aadhaar').optional().isString(),
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array(),
            });
        }
        const { email, name, password, mobile, aadhaar } = req.body;
        const aadhaarImageUrl = req.file ? `/uploads/aadhaar/${req.file.filename}` : null;
        const result = await service_1.AuthService.signup({
            email,
            name,
            password,
            mobile,
            aadhaar,
            aadhaarImage: aadhaarImageUrl || undefined,
        });
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').notEmpty(),
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array(),
            });
        }
        const { email, password } = req.body;
        console.log('🔍 Login attempt - Original email:', req.body.email);
        console.log('🔍 Login attempt - Normalized email:', email);
        console.log('🔍 Login attempt - Password length:', password.length);
        const result = await service_1.AuthService.login({
            email,
            password,
        });
        console.log('✅ Login route - Sending successful response');
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/dealer-signup', aadhaarUpload.single('aadhaarImage'), [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('name').trim().isLength({ min: 2 }),
    (0, express_validator_1.body)('password').isLength({ min: 8 }),
    (0, express_validator_1.body)('mobile').optional().isString(),
    (0, express_validator_1.body)('aadhaar').optional().isString(),
    (0, express_validator_1.body)('referralCode').optional().isString(),
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array(),
            });
        }
        const { email, name, password, mobile, aadhaar, referralCode } = req.body;
        const aadhaarImageUrl = req.file ? `/uploads/aadhaar/${req.file.filename}` : null;
        const result = await service_1.AuthService.dealerSignup({
            email,
            name,
            password,
            mobile,
            aadhaar,
            referralCode,
            aadhaarImage: aadhaarImageUrl || undefined,
        });
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/apply-dealer', (0, middleware_1.authMiddleware)(['USER']), [
    (0, express_validator_1.body)('referralCode').optional().isString(),
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array(),
            });
        }
        const { referralCode } = req.body;
        const userId = req.user.id;
        const result = await service_1.AuthService.applyForDealer(userId, { referralCode });
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
router.put('/profile', (0, middleware_1.authMiddleware)(['USER', 'DEALER', 'ADMIN']), [
    (0, express_validator_1.body)('name').trim().isLength({ min: 2 }),
    (0, express_validator_1.body)('mobile').optional().matches(/^[6-9]\d{9}$/).withMessage('Mobile number must be a valid 10-digit Indian mobile number'),
    (0, express_validator_1.body)('aadhaar').optional().isLength({ min: 12, max: 12 }).matches(/^\d{12}$/),
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array(),
            });
        }
        const { name, mobile, aadhaar, profilePic } = req.body;
        const userId = req.user.id;
        const result = await service_1.AuthService.updateProfile(userId, { name, mobile, aadhaar, profilePic });
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/profile-picture', (0, middleware_1.authMiddleware)(['USER', 'DEALER', 'ADMIN']), upload.single('profilePic'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded',
            });
        }
        const userId = req.user.id;
        const profilePicUrl = `/uploads/profiles/${req.file.filename}`;
        await service_1.AuthService.updateProfilePicture(userId, profilePicUrl);
        res.json({
            success: true,
            data: { profilePicUrl },
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/aadhaar-image', (0, middleware_1.authMiddleware)(['USER', 'DEALER', 'ADMIN']), aadhaarUpload.single('aadhaarImage'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded',
            });
        }
        const userId = req.user.id;
        const aadhaarImageUrl = `/uploads/aadhaar/${req.file.filename}`;
        await service_1.AuthService.updateAadhaarImage(userId, aadhaarImageUrl);
        res.json({
            success: true,
            data: { aadhaarImageUrl },
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/me', async (req, res, next) => {
    try {
        res.json({
            success: true,
            data: {
                id: 'mock-user-id',
                email: 'test@example.com',
                name: 'Test User',
                role: 'USER',
                message: 'MVP mode - no authentication required'
            },
        });
    }
    catch (error) {
        next(error);
    }
});
router.put('/password', (0, middleware_1.authMiddleware)(['USER', 'DEALER', 'ADMIN']), [
    (0, express_validator_1.body)('currentPassword').notEmpty(),
    (0, express_validator_1.body)('newPassword').isLength({ min: 8 }),
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array(),
            });
        }
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;
        const result = await service_1.AuthService.changePassword(userId, { currentPassword, newPassword });
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
router.put('/approve-dealer/:dealerId', (0, middleware_1.authMiddleware)(['ADMIN']), async (req, res, next) => {
    try {
        const { dealerId } = req.params;
        const result = await service_1.AuthService.approveDealer(dealerId);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/dealer-hierarchy/:dealerId', (0, middleware_1.authMiddleware)(['ADMIN', 'DEALER']), async (req, res, next) => {
    try {
        const { dealerId } = req.params;
        const hierarchy = await service_1.AuthService.getDealerHierarchy(dealerId);
        res.json({
            success: true,
            data: hierarchy,
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully',
    });
});
exports.default = router;
//# sourceMappingURL=routes.js.map