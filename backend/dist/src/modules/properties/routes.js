"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const express_validator_1 = require("express-validator");
const service_1 = require("./service");
const middleware_1 = require("../auth/middleware");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image and video files are allowed'));
        }
    },
});
router.get('/', middleware_1.optionalAuth, async (req, res, next) => {
    try {
        const { type, location, minPrice, maxPrice, status, dealerId, ownerId, page = 1, limit = 10, } = req.query;
        const filters = {
            type: type,
            location: location,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            status: status,
            dealerId: dealerId,
            ownerId: ownerId,
        };
        const result = await service_1.PropertyService.getProperties(filters, parseInt(page), parseInt(limit));
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/admin/all', (0, middleware_1.authMiddleware)(['ADMIN']), async (req, res, next) => {
    try {
        const { type, location, minPrice, maxPrice, status, dealerId, page = 1, limit = 100, } = req.query;
        const filters = {
            type: type,
            location: location,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            status: status,
            dealerId: dealerId,
        };
        const result = await service_1.PropertyService.getAllPropertiesForAdmin(filters, parseInt(page), parseInt(limit));
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id', middleware_1.optionalAuth, async (req, res, next) => {
    try {
        const { id } = req.params;
        const property = await service_1.PropertyService.getPropertyById(id);
        if (!property) {
            return res.status(404).json({
                success: false,
                error: 'Property not found',
            });
        }
        res.json({
            success: true,
            data: property,
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/', [
    (0, middleware_1.authMiddleware)(['USER', 'DEALER', 'ADMIN']),
    upload.array('mediaFiles', 10),
    (0, express_validator_1.body)('title').trim().isLength({ min: 3, max: 100 }),
    (0, express_validator_1.body)('description').trim().isLength({ min: 10, max: 1000 }),
    (0, express_validator_1.body)('type').trim().notEmpty(),
    (0, express_validator_1.body)('location').optional().trim().isLength({ max: 100 }),
    (0, express_validator_1.body)('address').trim().notEmpty().isLength({ min: 5, max: 500 }),
    (0, express_validator_1.body)('latitude').optional().custom((value) => {
        if (value === '' || value === null || value === undefined) {
            return true;
        }
        const num = parseFloat(value);
        if (isNaN(num) || num < -90 || num > 90) {
            throw new Error('Latitude must be a valid number between -90 and 90');
        }
        return true;
    }),
    (0, express_validator_1.body)('longitude').optional().custom((value) => {
        if (value === '' || value === null || value === undefined) {
            return true;
        }
        const num = parseFloat(value);
        if (isNaN(num) || num < -180 || num > 180) {
            throw new Error('Longitude must be a valid number between -180 and 180');
        }
        return true;
    }),
    (0, express_validator_1.body)('price').isFloat({ min: 0 }),
    (0, express_validator_1.body)('dealerId').optional().isUUID(),
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
        const { title, description, type, location, address, latitude, longitude, price, dealerId } = req.body;
        const mediaFiles = req.files;
        const property = await service_1.PropertyService.createProperty({
            title,
            description,
            type,
            location,
            address,
            latitude: latitude ? parseFloat(latitude) : undefined,
            longitude: longitude ? parseFloat(longitude) : undefined,
            price: parseFloat(price),
            mediaFiles,
            dealerId,
        }, req.user.id);
        res.status(201).json({
            success: true,
            data: property,
        });
    }
    catch (error) {
        next(error);
    }
});
router.put('/:id', [
    (0, middleware_1.authMiddleware)(['USER', 'DEALER', 'ADMIN']),
    upload.array('mediaFiles', 10),
    (0, express_validator_1.body)('title').optional().trim().isLength({ min: 3, max: 100 }),
    (0, express_validator_1.body)('description').optional().trim().isLength({ min: 10, max: 1000 }),
    (0, express_validator_1.body)('type').optional().trim().notEmpty(),
    (0, express_validator_1.body)('location').optional().trim().notEmpty(),
    (0, express_validator_1.body)('address').optional().trim().isLength({ max: 500 }),
    (0, express_validator_1.body)('latitude').optional().custom((value) => {
        if (value === '' || value === null || value === undefined) {
            return true;
        }
        const num = parseFloat(value);
        if (isNaN(num) || num < -90 || num > 90) {
            throw new Error('Latitude must be a valid number between -90 and 90');
        }
        return true;
    }),
    (0, express_validator_1.body)('longitude').optional().custom((value) => {
        if (value === '' || value === null || value === undefined) {
            return true;
        }
        const num = parseFloat(value);
        if (isNaN(num) || num < -180 || num > 180) {
            throw new Error('Longitude must be a valid number between -180 and 180');
        }
        return true;
    }),
    (0, express_validator_1.body)('price').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('status').optional().isIn(['FREE', 'BOOKED', 'SOLD']),
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
        const { id } = req.params;
        const { title, description, type, location, address, latitude, longitude, price, status } = req.body;
        const mediaFiles = req.files;
        const property = await service_1.PropertyService.updateProperty(id, {
            title,
            description,
            type,
            location,
            address,
            latitude: latitude ? parseFloat(latitude) : undefined,
            longitude: longitude ? parseFloat(longitude) : undefined,
            price: price ? parseFloat(price) : undefined,
            status,
            mediaFiles,
        }, req.user.id);
        res.json({
            success: true,
            data: property,
        });
    }
    catch (error) {
        next(error);
    }
});
router.delete('/:id', (0, middleware_1.authMiddleware)(['USER', 'DEALER', 'ADMIN']), async (req, res, next) => {
    try {
        const { id } = req.params;
        await service_1.PropertyService.deleteProperty(id, req.user.id);
        res.json({
            success: true,
            message: 'Property deleted successfully',
        });
    }
    catch (error) {
        next(error);
    }
});
router.patch('/:id/status', [
    (0, middleware_1.authMiddleware)(['ADMIN']),
    (0, express_validator_1.body)('status').isIn(['FREE', 'BOOKED', 'SOLD']),
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
        const { id } = req.params;
        const { status } = req.body;
        const property = await service_1.PropertyService.updatePropertyStatus(id, status, req.user.id);
        res.json({
            success: true,
            data: property,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/types/list', async (req, res, next) => {
    try {
        const types = await service_1.PropertyService.getPropertyTypes();
        res.json({
            success: true,
            data: types,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/locations/list', async (req, res, next) => {
    try {
        const locations = await service_1.PropertyService.getLocations();
        res.json({
            success: true,
            data: locations,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=routes.js.map