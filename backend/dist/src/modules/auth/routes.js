"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const service_1 = require("./service");
const middleware_1 = require("./middleware");
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
router.post('/dealer-signup', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('name').trim().isLength({ min: 2 }),
    (0, express_validator_1.body)('referralCode').optional().isString(),
    (0, express_validator_1.body)('parentId').optional().isUUID(),
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
        const { email, name, referralCode, parentId } = req.body;
        const result = await service_1.AuthService.dealerSignup({
            email,
            name,
            referralCode,
            parentId,
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