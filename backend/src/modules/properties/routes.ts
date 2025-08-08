import express from 'express';
import multer from 'multer';
import { body, query, validationResult } from 'express-validator';
import { PropertyService } from './service';
import { authMiddleware, optionalAuth } from '../auth/middleware';
import { AuthenticatedRequest } from '../auth/types';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  },
});

// Get all properties with filters
router.get('/', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const {
      type,
      location,
      minPrice,
      maxPrice,
      status,
      dealerId,
      page = 1,
      limit = 10,
    } = req.query;

    const filters = {
      type: type as string,
      location: location as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      status: status as string,
      dealerId: dealerId as string,
    };

    const result = await PropertyService.getProperties(
      filters,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// Get all properties for admin (including sold properties)
router.get('/admin/all', authMiddleware(['ADMIN']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const {
      type,
      location,
      minPrice,
      maxPrice,
      status,
      dealerId,
      page = 1,
      limit = 100,
    } = req.query;

    const filters = {
      type: type as string,
      location: location as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      status: status as string,
      dealerId: dealerId as string,
    };

    const result = await PropertyService.getAllPropertiesForAdmin(
      filters,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// Get property by ID
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const property = await PropertyService.getPropertyById(id);

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
  } catch (error) {
    next(error);
  }
});

// Create new property
router.post('/', [
  authMiddleware(['USER', 'DEALER', 'ADMIN']),
  upload.array('mediaFiles', 10), // Max 10 files
  body('title').trim().isLength({ min: 3, max: 100 }),
  body('description').trim().isLength({ min: 10, max: 1000 }),
  body('type').trim().notEmpty(),
  body('location').trim().notEmpty(),
  body('address').optional().trim().isLength({ max: 500 }),
  body('latitude').optional().isFloat({ min: -90, max: 90 }),
  body('longitude').optional().isFloat({ min: -180, max: 180 }),
  body('price').isFloat({ min: 0 }),
  body('dealerId').optional().isUUID(),
], async (req: AuthenticatedRequest, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { title, description, type, location, address, latitude, longitude, price, dealerId } = req.body;
    const mediaFiles = req.files as Express.Multer.File[];

    const property = await PropertyService.createProperty(
      {
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
      },
      req.user!.id
    );

    res.status(201).json({
      success: true,
      data: property,
    });
  } catch (error) {
    next(error);
  }
});

// Update property
router.put('/:id', [
  authMiddleware(['USER', 'DEALER', 'ADMIN']),
  upload.array('mediaFiles', 10),
  body('title').optional().trim().isLength({ min: 3, max: 100 }),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }),
  body('type').optional().trim().notEmpty(),
  body('location').optional().trim().notEmpty(),
  body('address').optional().trim().isLength({ max: 500 }),
  body('latitude').optional().isFloat({ min: -90, max: 90 }),
  body('longitude').optional().isFloat({ min: -180, max: 180 }),
  body('price').optional().isFloat({ min: 0 }),
  body('status').optional().isIn(['FREE', 'BOOKED', 'SOLD']),
], async (req: AuthenticatedRequest, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { id } = req.params;
    const { title, description, type, location, address, latitude, longitude, price, status } = req.body;
    const mediaFiles = req.files as Express.Multer.File[];

    const property = await PropertyService.updateProperty(
      id,
      {
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
      },
      req.user!.id
    );

    res.json({
      success: true,
      data: property,
    });
  } catch (error) {
    next(error);
  }
});

// Delete property
router.delete('/:id', authMiddleware(['USER', 'DEALER', 'ADMIN']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    await PropertyService.deleteProperty(id, req.user!.id);

    res.json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Update property status (admin only)
router.patch('/:id/status', [
  authMiddleware(['ADMIN']),
  body('status').isIn(['FREE', 'BOOKED', 'SOLD']),
], async (req: AuthenticatedRequest, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    const property = await PropertyService.updatePropertyStatus(id, status, req.user!.id);

    res.json({
      success: true,
      data: property,
    });
  } catch (error) {
    next(error);
  }
});

// Get property types
router.get('/types/list', async (req, res, next) => {
  try {
    const types = await PropertyService.getPropertyTypes();

    res.json({
      success: true,
      data: types,
    });
  } catch (error) {
    next(error);
  }
});

// Get locations
router.get('/locations/list', async (req, res, next) => {
  try {
    const locations = await PropertyService.getLocations();

    res.json({
      success: true,
      data: locations,
    });
  } catch (error) {
    next(error);
  }
});

export default router; 