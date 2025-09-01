import express from 'express';
import multer from 'multer';
import { body, query, validationResult } from 'express-validator';
import { PropertyService } from './service';
import { authMiddleware, optionalAuth } from '../auth/middleware';
import { AuthenticatedRequest } from '../auth/types';
import { S3Uploader } from '../../utils/s3Uploader';
import prisma from '../../config/database';

const router = express.Router();

// Configure multer for file uploads with increased limits
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit (increased from 10MB)
    files: 15, // Allow up to 15 files total
    fieldSize: 10 * 1024 * 1024, // 10MB for text fields
  },
  fileFilter: (req, file, cb) => {
    // Allow images, videos, PDFs, and documents
    if (
      file.mimetype.startsWith('image/') || 
      file.mimetype.startsWith('video/') ||
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only image, video, PDF, and document files are allowed'));
    }
  },
});

// Get all properties with filters
router.get('/', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const {
      type,
      action,
      location,
      city,
      state,
      minPrice,
      maxPrice,
      status,
      dealerId,
      ownerId,
      bhk,
      furnishingStatus,
      parkingAvailable,
      allowedTenants,
      minArea,
      maxArea,
      minRooms,
      maxRooms,
      amenities,
      additionalAmenities,
      availabilityDate,
      sortBy,
      sortOrder,
      page = 1,
      limit = 10,
    } = req.query;

    const filters = {
      type: type as string,
      action: action as string,
      location: location as string,
      city: city as string,
      state: state as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      status: status as string,
      dealerId: dealerId as string,
      ownerId: ownerId as string,
      bhk: bhk ? parseInt(bhk as string) : undefined,
      furnishingStatus: furnishingStatus as string,
      parkingAvailable: parkingAvailable === 'true',
      allowedTenants: allowedTenants as string,
      minArea: minArea ? parseFloat(minArea as string) : undefined,
      maxArea: maxArea ? parseFloat(maxArea as string) : undefined,
      minRooms: minRooms ? parseInt(minRooms as string) : undefined,
      maxRooms: maxRooms ? parseInt(maxRooms as string) : undefined,
      amenities: amenities ? (amenities as string).split(',') : undefined,
      additionalAmenities: additionalAmenities as string,
      availabilityDate: availabilityDate as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
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

// Debug endpoint to check all properties
router.get('/debug/all', async (req, res, next) => {
  try {
    const allProperties = await prisma.property.findMany({
      include: {
        owner: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: {
        total: allProperties.length,
        properties: allProperties.map(p => ({
          id: p.id,
          title: p.title,
          status: p.status,
          ownerId: p.ownerId,
          ownerName: p.owner?.name,
          ownerEmail: p.owner?.email,
          createdAt: p.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Debug endpoint to test admin query directly
router.get('/debug/admin-query', async (req, res, next) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    console.log('🔍 Debug admin query - page:', page, 'limit:', limit, 'skip:', skip);
    
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        include: {
          owner: true,
          dealer: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.property.count(),
    ]);

    console.log('🔍 Debug admin query - found properties:', properties.length);
    console.log('🔍 Debug admin query - total count:', total);
    console.log('🔍 Debug admin query - property IDs:', properties.map(p => p.id));

    res.json({
      success: true,
      data: {
        properties,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string)),
        },
      },
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
      action,
      location,
      minPrice,
      maxPrice,
      status,
      dealerId,
      bhk,
      furnishingStatus,
      parkingAvailable,
      allowedTenants,
      page = 1,
      limit = 100,
    } = req.query;

    const filters = {
      type: type as string,
      action: action as string,
      location: location as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      status: status as string,
      dealerId: dealerId as string,
      bhk: bhk ? parseInt(bhk as string) : undefined,
      furnishingStatus: furnishingStatus as string,
      parkingAvailable: parkingAvailable === 'true',
      allowedTenants: allowedTenants as string,
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
  upload.fields([
    { name: 'mediaFiles', maxCount: 10 },
    { name: 'electricityBillImage', maxCount: 1 },
    { name: 'waterBillImage', maxCount: 1 },
    { name: 'registryImage', maxCount: 5 },
    { name: 'otherDocuments', maxCount: 10 },
    { name: 'listingFeeProof', maxCount: 1 },
    // Additional fields for edit mode (these are text fields, not files)
    { name: 'existingImageUrls', maxCount: 0 },
    { name: 'existingElectricityBillImage', maxCount: 0 },
    { name: 'existingWaterBillImage', maxCount: 0 },
    { name: 'existingRegistryUrls', maxCount: 0 },
    { name: 'existingOtherDocuments', maxCount: 0 },
  ]),
  body('title').trim().isLength({ min: 3, max: 200 }),
  body('description').trim().isLength({ min: 10, max: 1000 }),
  body('type').trim().notEmpty(),
  body('action').optional().isIn(['RENT', 'LEASE', 'SELL']),
  body('location').optional().trim().isLength({ max: 100 }),
  body('address').trim().notEmpty().isLength({ min: 5, max: 500 }),
  body('latitude').optional().custom((value) => {
    if (value === '' || value === null || value === undefined) {
      return true; // Allow empty values
    }
    const num = parseFloat(value);
    if (isNaN(num) || num < -90 || num > 90) {
      throw new Error('Latitude must be a valid number between -90 and 90');
    }
    return true;
  }),
  body('longitude').optional().custom((value) => {
    if (value === '' || value === null || value === undefined) {
      return true; // Allow empty values
    }
    const num = parseFloat(value);
    if (isNaN(num) || num < -180 || num > 180) {
      throw new Error('Longitude must be a valid number between -180 and 180');
    }
    return true;
  }),
  body('price').optional().isFloat({ min: 0 }),
  body('area').optional().isFloat({ min: 0 }),
  body('dimensions').optional().trim().isLength({ max: 200 }),
  body('specifications').optional().trim().isLength({ max: 1000 }),
  body('availabilityDate').optional().isISO8601(),
  body('listedBy').optional().isIn(['Owner', 'Agent', 'Other']),
  body('bhk').optional().isInt({ min: 1 }),
  body('parkingAvailable').optional().isBoolean(),
  body('numberOfRooms').optional().isInt({ min: 1 }),
  body('furnishingStatus').optional().isIn(['FURNISHED', 'SEMI_FURNISHED', 'UNFURNISHED']),
  body('amenities').optional().trim().isLength({ max: 1000 }),
  body('perMonthCharges').optional().isFloat({ min: 0 }),
  body('noticePeriod').optional().isInt({ min: 1 }),
  body('allowedTenants').optional().isIn(['FAMILY', 'BACHELORS', 'ANYONE']),
  body('leaseDuration').optional().isInt({ min: 1 }),
  body('electricityBillImage').optional().trim(),
  body('waterBillImage').optional().trim(),
  body('registryImage').optional().trim(),
  body('otherDocuments').optional().trim(),
  body('registeredAs').optional().isIn(['OWNER', 'DEALER', 'OTHER']),
  body('registeredAsDescription').optional().trim().isLength({ max: 500 }),
  body('additionalAmenities').optional().trim().isLength({ max: 1000 }),
  body('mobileNumber').optional().trim().isLength({ min: 10, max: 15 }),
  body('dealerId').optional().isUUID(),
  body('listingFeeProof').optional().trim(),
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

    const { 
      title, description, type, action, 
      // New address fields
      city, state, pincode, locality, street, landmark, subRegion,
      // Property type specific fields
      flatNumber, buildingName, shopNumber, complexName, plotNumber,
      // Legacy fields
      location, address, latitude, longitude, 
      price, area, dimensions, specifications, availabilityDate, listedBy,
      bhk, parkingAvailable, numberOfRooms, furnishingStatus, amenities,
      perMonthCharges, noticePeriod, allowedTenants, leaseDuration,
      registeredAs, registeredAsDescription, additionalAmenities, mobileNumber,
      dealerId 
    } = req.body;
    
    // Handle files from upload.fields()
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } || {};
    const mediaFiles = files.mediaFiles || [];
    const electricityBillFile = files.electricityBillImage?.[0];
    const waterBillFile = files.waterBillImage?.[0];
    const registryFiles = files.registryImage || [];
    const otherDocumentsFiles = files.otherDocuments || [];
    const listingFeeProofFile = files.listingFeeProof?.[0];

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    const property = await PropertyService.createProperty(
      {
        title,
        description,
        type,
        action,
        // New address fields
        city,
        state,
        pincode,
        locality,
        street,
        landmark,
        subRegion,
        // Property type specific fields
        flatNumber,
        buildingName,
        shopNumber,
        complexName,
        plotNumber,
        // Legacy fields
        location,
        address,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        price: price ? parseFloat(price) : undefined,
        area: area ? parseFloat(area) : undefined,
        dimensions,
        specifications,
        availabilityDate: availabilityDate ? new Date(availabilityDate) : undefined,
        listedBy,
        bhk: bhk ? parseInt(bhk) : undefined,
        parkingAvailable: parkingAvailable === 'true' || parkingAvailable === true,
        numberOfRooms: numberOfRooms ? parseInt(numberOfRooms) : undefined,
        furnishingStatus,
        amenities,
        perMonthCharges: perMonthCharges ? parseFloat(perMonthCharges) : undefined,
        noticePeriod: noticePeriod ? parseInt(noticePeriod) : undefined,
        allowedTenants,
        leaseDuration: leaseDuration ? parseInt(leaseDuration) : undefined,
        electricityBillImage: electricityBillFile,
        waterBillImage: waterBillFile,
        registryImage: registryFiles,
        otherDocuments: otherDocumentsFiles,
        listingFeeProof: listingFeeProofFile,
        registeredAs,
        registeredAsDescription,
        additionalAmenities,
        mobileNumber,
        mediaFiles,
        dealerId,
      },
      req.user.id
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
  upload.fields([
    { name: 'mediaFiles', maxCount: 10 },
    { name: 'electricityBillImage', maxCount: 1 },
    { name: 'waterBillImage', maxCount: 1 },
    { name: 'registryImage', maxCount: 5 },
    { name: 'otherDocuments', maxCount: 10 },
    // Additional fields for edit mode (these are text fields, not files)
    { name: 'existingImageUrls', maxCount: 0 },
    { name: 'existingElectricityBillImage', maxCount: 0 },
    { name: 'existingWaterBillImage', maxCount: 0 },
    { name: 'existingRegistryUrls', maxCount: 0 },
    { name: 'existingOtherDocuments', maxCount: 0 },
  ]),
  body('title').optional().trim().isLength({ min: 3, max: 100 }),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }),
  body('type').optional().trim().notEmpty(),
  body('action').optional().isIn(['RENT', 'LEASE', 'SELL']),
  body('location').optional().trim().notEmpty(),
  body('address').optional().trim().isLength({ max: 500 }),
  body('latitude').optional().custom((value) => {
    if (value === '' || value === null || value === undefined) {
      return true; // Allow empty values
    }
    const num = parseFloat(value);
    if (isNaN(num) || num < -90 || num > 90) {
      throw new Error('Latitude must be a valid number between -90 and 90');
    }
    return true;
  }),
  body('longitude').optional().custom((value) => {
    if (value === '' || value === null || value === undefined) {
      return true; // Allow empty values
    }
    const num = parseFloat(value);
    if (isNaN(num) || num < -180 || num > 180) {
      throw new Error('Longitude must be a valid number between -180 and 180');
    }
    return true;
  }),
  body('price').optional().isFloat({ min: 0 }),
  body('area').optional().isFloat({ min: 0 }),
  body('dimensions').optional().trim().isLength({ max: 200 }),
  body('specifications').optional().trim().isLength({ max: 1000 }),
  body('availabilityDate').optional().isISO8601(),
  body('listedBy').optional().isIn(['Owner', 'Agent', 'Other']),
  body('bhk').optional().isInt({ min: 1 }),
  body('parkingAvailable').optional().isBoolean(),
  body('numberOfRooms').optional().isInt({ min: 1 }),
  body('furnishingStatus').optional().isIn(['FURNISHED', 'SEMI_FURNISHED', 'UNFURNISHED']),
  body('amenities').optional().trim().isLength({ max: 1000 }),
  body('perMonthCharges').optional().isFloat({ min: 0 }),
  body('noticePeriod').optional().isInt({ min: 1 }),
  body('allowedTenants').optional().isIn(['FAMILY', 'BACHELORS', 'ANYONE']),
  body('leaseDuration').optional().isInt({ min: 1 }),
  body('electricityBillImage').optional().trim(),
  body('waterBillImage').optional().trim(),
  body('registryImage').optional().trim(),
  body('otherDocuments').optional().trim(),
  body('registeredAs').optional().isIn(['OWNER', 'DEALER', 'OTHER']),
  body('registeredAsDescription').optional().trim().isLength({ max: 500 }),
  body('additionalAmenities').optional().trim().isLength({ max: 1000 }),
  body('mobileNumber').optional().trim().isLength({ min: 10, max: 15 }),
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
    const { 
      title, description, type, action, location, address, city, state, pincode, locality, street, landmark, subRegion,
      flatNumber, buildingName, shopNumber, complexName, plotNumber, latitude, longitude, price, status,
      area, dimensions, specifications, availabilityDate, listedBy,
      bhk, parkingAvailable, numberOfRooms, furnishingStatus, amenities,
      perMonthCharges, noticePeriod, allowedTenants, leaseDuration,
      registeredAs, registeredAsDescription, additionalAmenities, mobileNumber,
      mediaUrls, existingImageUrls, existingElectricityBillUrl, existingWaterBillUrl, existingRegistryUrls, existingOtherDocuments
    } = req.body;
    
    // Handle files from upload.fields()
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } || {};
    const mediaFiles = files.mediaFiles || [];
    const electricityBillFile = files.electricityBillImage?.[0];
    const waterBillFile = files.waterBillImage?.[0];
    const registryFiles = files.registryImage || [];
    const otherDocumentsFiles = files.otherDocuments || [];

    console.log('🔍 Property update route - User object:', req.user);
    console.log('🔍 Property update route - User ID:', req.user?.id);
    
    const property = await PropertyService.updateProperty(
      id,
      {
        title,
        description,
        type,
        action,
        location,
        address,
        city,
        state,
        pincode,
        locality,
        street,
        landmark,
        subRegion,
        flatNumber,
        buildingName,
        shopNumber,
        complexName,
        plotNumber,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        price: price ? parseFloat(price) : undefined,
        area: area ? parseFloat(area) : undefined,
        dimensions,
        specifications,
        availabilityDate: availabilityDate ? new Date(availabilityDate) : undefined,
        listedBy,
        bhk: bhk ? parseInt(bhk) : undefined,
        parkingAvailable: parkingAvailable === 'true' || parkingAvailable === true,
        numberOfRooms: numberOfRooms ? parseInt(numberOfRooms) : undefined,
        furnishingStatus,
        amenities,
        perMonthCharges: perMonthCharges ? parseFloat(perMonthCharges) : undefined,
        noticePeriod: noticePeriod ? parseInt(noticePeriod) : undefined,
        allowedTenants,
        leaseDuration: leaseDuration ? parseInt(leaseDuration) : undefined,
        electricityBillImage: electricityBillFile,
        waterBillImage: waterBillFile,
        registryImage: registryFiles,
        otherDocuments: otherDocumentsFiles,
        registeredAs,
        registeredAsDescription,
        additionalAmenities,
        mobileNumber,
        status,
        mediaUrls,
        mediaFiles,
        existingImageUrls,
        existingElectricityBillUrl,
        existingWaterBillUrl,
        existingRegistryUrls,
        existingOtherDocuments,
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

// Upload property image
router.post('/upload-image', [
  authMiddleware(['USER', 'DEALER', 'ADMIN']),
  upload.single('image'),
], async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided',
      });
    }

    // Upload to S3 or local storage
    const uploadResult = await S3Uploader.uploadFile(req.file, 'properties');
    
    res.json({
      success: true,
      data: {
        url: uploadResult.url,
        key: uploadResult.key,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router; 