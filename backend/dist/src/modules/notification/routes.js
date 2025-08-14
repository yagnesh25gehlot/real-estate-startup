"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middleware_1 = require("../auth/middleware");
const service_1 = require("./service");
const router = express_1.default.Router();
router.get('/', (0, middleware_1.authMiddleware)(['ADMIN']), async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search, type, read, date } = req.query;
        const filters = {
            search: search,
            type: type,
            read: read,
            date: date,
        };
        const result = await service_1.NotificationService.getAdminNotifications(parseInt(page), parseInt(limit), filters);
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
});
router.put('/:id/read', (0, middleware_1.authMiddleware)(['ADMIN']), async (req, res, next) => {
    try {
        const { id } = req.params;
        const notification = await service_1.NotificationService.markAsRead(id);
        res.json({ success: true, data: notification });
    }
    catch (error) {
        next(error);
    }
});
router.put('/mark-all-read', (0, middleware_1.authMiddleware)(['ADMIN']), async (req, res, next) => {
    try {
        const result = await service_1.NotificationService.markAllAsRead();
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
});
router.get('/unread-count', (0, middleware_1.authMiddleware)(['ADMIN']), async (req, res, next) => {
    try {
        const count = await service_1.NotificationService.getUnreadCount();
        res.json({ success: true, data: { count } });
    }
    catch (error) {
        next(error);
    }
});
router.delete('/cleanup', (0, middleware_1.authMiddleware)(['ADMIN']), async (req, res, next) => {
    try {
        const result = await service_1.NotificationService.cleanupOldNotifications();
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=routes.js.map