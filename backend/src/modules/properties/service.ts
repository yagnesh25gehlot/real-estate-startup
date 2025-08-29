import { Property, User } from '@prisma/client';
import { createError } from '../../utils/errorHandler';
import { S3Uploader } from '../../utils/s3Uploader';
import { NotificationService } from '../notification/service';
import { WhatsAppService } from '../../services/whatsappService';
import prisma from '../../config/database';

export interface CreatePropertyData {
  title: string;
  description: string;
  type: string;
  action?: string; // RENT, LEASE, SELL
  location: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  price?: number; // Optional - only required for SELL action
  area?: number;
  dimensions?: string;
  specifications?: string;
  availabilityDate?: Date;
  listedBy?: string;
  
  // Property-specific fields
  bhk?: number;
  parkingAvailable?: boolean;
  numberOfRooms?: number;
  furnishingStatus?: string;
  amenities?: string;
  
  // Rent/Lease specific fields
  perMonthCharges?: number;
  noticePeriod?: number;
  allowedTenants?: string;
  leaseDuration?: number;
  
  // Document uploads (can be either file objects or URLs)
  electricityBillImage?: string | Express.Multer.File;
  waterBillImage?: string | Express.Multer.File;
  registryImage?: string | Express.Multer.File | Express.Multer.File[];
  otherDocuments?: Express.Multer.File[];
  listingFeeProof?: Express.Multer.File;
  
  // New fields
  registeredAs?: string;
  registeredAsDescription?: string;
  additionalAmenities?: string;
  mobileNumber?: string;
  
  mediaFiles?: Express.Multer.File[];
  dealerId?: string;
}

export interface UpdatePropertyData {
  title?: string;
  description?: string;
  type?: string;
  action?: string;
  location?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  price?: number;
  area?: number;
  dimensions?: string;
  specifications?: string;
  availabilityDate?: Date;
  listedBy?: string;
  status?: string;
  
  // Property-specific fields
  bhk?: number;
  parkingAvailable?: boolean;
  numberOfRooms?: number;
  furnishingStatus?: string;
  amenities?: string;
  
  // Rent/Lease specific fields
  perMonthCharges?: number;
  noticePeriod?: number;
  allowedTenants?: string;
  leaseDuration?: number;
  
  // Document uploads (can be either file objects or URLs)
  electricityBillImage?: string | Express.Multer.File;
  waterBillImage?: string | Express.Multer.File;
  registryImage?: string | Express.Multer.File | Express.Multer.File[];
  otherDocuments?: Express.Multer.File[];
  
  // New fields
  registeredAs?: string;
  registeredAsDescription?: string;
  additionalAmenities?: string;
  mobileNumber?: string;
  
  mediaUrls?: string;
  mediaFiles?: Express.Multer.File[];
  existingImageUrls?: string;
  existingElectricityBillUrl?: string;
  existingWaterBillUrl?: string;
  existingRegistryUrls?: string;
  existingOtherDocuments?: string;
}

export interface PropertyFilters {
  type?: string;
  action?: string; // RENT, LEASE, SELL
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  dealerId?: string;
  ownerId?: string;
  bhk?: number;
  furnishingStatus?: string;
  parkingAvailable?: boolean;
  allowedTenants?: string;
  minArea?: number;
  maxArea?: number;
  minRooms?: number;
  maxRooms?: number;
  availabilityDate?: string;
  minPerMonthCharges?: number;
  maxPerMonthCharges?: number;
  amenities?: string[];
  additionalAmenities?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class PropertyService {
  // Calculate booking charges based on action and price
  private static calculateBookingCharges(action: string, price?: number, leaseDuration?: number): number {
    if (!price) {
      return 0; // No booking charges if no price
    }
    
    switch (action) {
      case 'RENT':
        return price; // 1 month's rent
      case 'LEASE':
        return leaseDuration ? price / leaseDuration : price; // Total amount ÷ Number of months
      case 'SELL':
        return price * 0.02; // 2% of property value
      default:
        return price * 0.02; // Default to 2%
    }
  }

  static async createProperty(data: CreatePropertyData, ownerId: string): Promise<Property> {
    try {
      console.log('🚀 Starting property creation for owner:', ownerId);
      console.log('📁 Files to upload:', {
        mediaFiles: data.mediaFiles?.length || 0,
        electricityBill: !!data.electricityBillImage,
        waterBill: !!data.waterBillImage,
        registry: !!data.registryImage
      });

      let mediaUrls: string = '[]';
      let electricityBillUrl: string | undefined;
      let waterBillUrl: string | undefined;
      let registryUrl: string | undefined;

      // Upload media files to S3
      if (data.mediaFiles && data.mediaFiles.length > 0) {
        console.log('📤 Uploading media files to S3...');
        const uploadResults = await S3Uploader.uploadMultipleFiles(data.mediaFiles);
        const urls = uploadResults.map(result => result.url);
        mediaUrls = JSON.stringify(urls);
        console.log('✅ Media files uploaded successfully:', urls.length, 'files');
      }

      // Upload document files to S3
      if (data.electricityBillImage && typeof data.electricityBillImage !== 'string') {
        console.log('📤 Uploading electricity bill to S3...');
        const uploadResult = await S3Uploader.uploadDocument(data.electricityBillImage, 'documents');
        electricityBillUrl = uploadResult.url;
        console.log('✅ Electricity bill uploaded successfully');
      } else if (typeof data.electricityBillImage === 'string') {
        electricityBillUrl = data.electricityBillImage;
      }

      if (data.waterBillImage && typeof data.waterBillImage !== 'string') {
        console.log('📤 Uploading water bill to S3...');
        const uploadResult = await S3Uploader.uploadDocument(data.waterBillImage, 'documents');
        waterBillUrl = uploadResult.url;
        console.log('✅ Water bill uploaded successfully');
      } else if (typeof data.waterBillImage === 'string') {
        waterBillUrl = data.waterBillImage;
      }

      if (data.registryImage) {
        if (Array.isArray(data.registryImage)) {
          // Handle multiple registry files
          console.log('📤 Uploading multiple registry files to S3...');
          const uploadPromises = data.registryImage.map(file => 
            S3Uploader.uploadDocument(file, 'documents')
          );
          const uploadResults = await Promise.all(uploadPromises);
          const registryUrls = uploadResults.map(result => result.url);
          registryUrl = JSON.stringify(registryUrls);
          console.log('✅ Multiple registry files uploaded successfully');
        } else if (typeof data.registryImage !== 'string') {
          // Handle single registry file
          console.log('📤 Uploading single registry file to S3...');
          const uploadResult = await S3Uploader.uploadDocument(data.registryImage, 'documents');
          registryUrl = uploadResult.url;
          console.log('✅ Single registry file uploaded successfully');
        } else {
                // Handle string URL
      registryUrl = data.registryImage;
    }
  }

  // Handle other documents
  let otherDocumentsUrl: string | null = null;
  if (data.otherDocuments && Array.isArray(data.otherDocuments) && data.otherDocuments.length > 0) {
    console.log('📤 Uploading other documents to S3...');
    const uploadPromises = data.otherDocuments.map(file => 
      S3Uploader.uploadDocument(file, 'documents')
    );
    const uploadResults = await Promise.all(uploadPromises);
    const otherDocumentsUrls = uploadResults.map(result => result.url);
    otherDocumentsUrl = JSON.stringify(otherDocumentsUrls);
    console.log('✅ Other documents uploaded successfully');
  }

  // Handle listing fee proof
  let listingFeeProofUrl: string | null = null;
  if (data.listingFeeProof) {
    console.log('📤 Uploading listing fee proof to S3...');
    const uploadResult = await S3Uploader.uploadDocument(data.listingFeeProof, 'documents');
    listingFeeProofUrl = uploadResult.url;
    console.log('✅ Listing fee proof uploaded successfully');
  }

  // Calculate booking charges
  const bookingCharges = this.calculateBookingCharges(
    data.action || 'SELL', 
    data.price, 
    data.leaseDuration
  );

      console.log('💾 Creating property in database...');
      const property = await prisma.property.create({
        data: {
          title: data.title,
          description: data.description,
          type: data.type,
          action: data.action || 'SELL',
          location: data.location,
          address: data.address || '',
          latitude: data.latitude,
          longitude: data.longitude,
          price: data.price || null,
          area: data.area,
          dimensions: data.dimensions,
          specifications: data.specifications,
          availabilityDate: data.availabilityDate,
          listedBy: data.listedBy,
          
          // Property-specific fields
          bhk: data.bhk,
          parkingAvailable: data.parkingAvailable || false,
          numberOfRooms: data.numberOfRooms,
          furnishingStatus: data.furnishingStatus,
          amenities: data.amenities,
          
          // Rent/Lease specific fields
          perMonthCharges: data.perMonthCharges,
          noticePeriod: data.noticePeriod,
          allowedTenants: data.allowedTenants,
          leaseDuration: data.leaseDuration,
          
          // Document uploads
          electricityBillImage: electricityBillUrl,
          waterBillImage: waterBillUrl,
          registryImage: registryUrl,
          otherDocuments: otherDocumentsUrl,
          listingFeeProof: listingFeeProofUrl,
          
          // New fields
          registeredAs: data.registeredAs,
          registeredAsDescription: data.registeredAsDescription,
          additionalAmenities: data.additionalAmenities,
          mobileNumber: data.mobileNumber,
          
          // Booking charges
          bookingCharges,
          
          mediaUrls,
          ownerId,
          dealerId: data.dealerId,
        },
      });

      // Fetch the created property with includes
      const propertyWithIncludes = await prisma.property.findUnique({
        where: { id: property.id },
        include: {
          owner: true,
          dealer: {
            include: {
              user: true,
            },
          },
        },
      });

      console.log('✅ Property created successfully:', property.id);

      // Send notification to admin
      try {
        const owner = await prisma.user.findUnique({ where: { id: property.ownerId } });
        if (owner) {
          const hasListingFee = !!listingFeeProofUrl;
          await NotificationService.createNotification({
            userId: 'admin', // This will be sent to all admins
            type: 'PROPERTY_ADDED',
            title: hasListingFee ? 'New Premium Property Added' : 'New Property Added',
            message: `${owner.name || owner.email} added a new ${hasListingFee ? 'premium ' : ''}property: ${property.title} in ${property.location}${hasListingFee ? ' (Listing fee paid)' : ''}`
          });

          // Send WhatsApp notification
          await WhatsAppService.sendPropertyNotification(propertyWithIncludes, 'ADDED');
        }
      } catch (notificationError) {
        console.error('Failed to send property added notification:', notificationError);
        // Don't fail the property creation if notification fails
      }

      return propertyWithIncludes;
    } catch (error) {
      console.error('Property creation error:', error);
      throw createError(`Failed to create property: ${error.message}`, 500);
    }
  }

  static async getProperties(filters: PropertyFilters = {}, page: number = 1, limit: number = 10) {
    try {
      console.log('🔍 Regular properties query - filters:', filters);
      console.log('🔍 Regular properties query - page:', page, 'limit:', limit);
      
      const skip = (page - 1) * limit;
      
      const where: any = {};

      if (filters.type) {
        where.type = filters.type;
      }

      if (filters.action) {
        where.action = filters.action;
      }

      if (filters.location) {
        where.location = {
          contains: filters.location,
          mode: 'insensitive',
        };
      }

      if (filters.minPrice || filters.maxPrice) {
        where.price = {};
        if (filters.minPrice) where.price.gte = filters.minPrice;
        if (filters.maxPrice) where.price.lte = filters.maxPrice;
      }

      if (filters.status) {
        where.status = filters.status;
      } else {
        // By default, exclude SOLD properties unless specifically requested
        where.status = { not: 'SOLD' };
      }

      if (filters.dealerId) {
        where.dealerId = filters.dealerId;
      }

      if (filters.ownerId) {
        where.ownerId = filters.ownerId;
      }

      // Additional filters for enhanced property search
      if (filters.bhk) {
        where.bhk = filters.bhk;
      }

      if (filters.furnishingStatus) {
        where.furnishingStatus = filters.furnishingStatus;
      }

      if (filters.parkingAvailable !== undefined) {
        where.parkingAvailable = filters.parkingAvailable;
      }

      if (filters.allowedTenants) {
        where.allowedTenants = filters.allowedTenants;
      }

      // Area filters
      if (filters.minArea || filters.maxArea) {
        where.area = {};
        if (filters.minArea) where.area.gte = filters.minArea;
        if (filters.maxArea) where.area.lte = filters.maxArea;
      }

      // Rooms filters
      if (filters.minRooms || filters.maxRooms) {
        where.numberOfRooms = {};
        if (filters.minRooms) where.numberOfRooms.gte = filters.minRooms;
        if (filters.maxRooms) where.numberOfRooms.lte = filters.maxRooms;
      }

      // Availability date filter
      if (filters.availabilityDate) {
        where.availabilityDate = {
          lte: new Date(filters.availabilityDate),
        };
      }

      // Per month charges filters for rent/lease
      if (filters.minPerMonthCharges || filters.maxPerMonthCharges) {
        where.perMonthCharges = {};
        if (filters.minPerMonthCharges) where.perMonthCharges.gte = filters.minPerMonthCharges;
        if (filters.maxPerMonthCharges) where.perMonthCharges.lte = filters.maxPerMonthCharges;
      }

      // Amenities filter
      if (filters.amenities && filters.amenities.length > 0) {
        // Since amenities is stored as a JSON string, we need to check if it contains any of the selected amenities
        where.amenities = {
          not: null,
        };
        // We'll filter this in the application layer since Prisma doesn't support JSON array contains for strings
      }

      // Additional amenities filter
      if (filters.additionalAmenities) {
        where.additionalAmenities = {
          contains: filters.additionalAmenities,
          mode: 'insensitive',
        };
      }

      console.log('🔍 Regular properties query - where clause:', JSON.stringify(where, null, 2));

      // Build orderBy clause based on sortBy and sortOrder
      let orderBy: any = { createdAt: 'desc' }; // default
      
      if (filters.sortBy && filters.sortOrder) {
        const validSortFields = ['price', 'area', 'bhk', 'perMonthCharges', 'createdAt', 'title'];
        if (validSortFields.includes(filters.sortBy)) {
          orderBy = { [filters.sortBy]: filters.sortOrder };
        }
      }

      let properties = await prisma.property.findMany({
        where,
        include: {
          owner: true,
          dealer: {
            include: {
              user: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      });

      // Filter by amenities in application layer if needed
      if (filters.amenities && filters.amenities.length > 0) {
        properties = properties.filter(property => {
          if (!property.amenities) return false;
          
          // Split property amenities by comma and trim whitespace
          const propertyAmenities = property.amenities.split(',').map(amenity => amenity.trim());
          
          // Check if property has at least one of the selected amenities
          return filters.amenities!.some(selectedAmenity => 
            propertyAmenities.includes(selectedAmenity)
          );
        });
      }

      const total = await prisma.property.count({ where });

      return {
        properties,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error fetching properties:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        meta: error.meta
      });
      throw createError(`Failed to fetch properties: ${error.message}`, 500);
    }
  }

  static async getAllPropertiesForAdmin(filters: PropertyFilters = {}, page: number = 1, limit: number = 100) {
    try {
      console.log('🔍 Admin properties query - filters:', filters);
      console.log('🔍 Admin properties query - page:', page, 'limit:', limit);
      
      const skip = (page - 1) * limit;
      
      const where: any = {};

      if (filters.type) {
        where.type = filters.type;
      }

      if (filters.action) {
        where.action = filters.action;
      }

      if (filters.location) {
        where.location = {
          contains: filters.location,
          mode: 'insensitive',
        };
      }

      if (filters.minPrice || filters.maxPrice) {
        where.price = {};
        if (filters.minPrice) where.price.gte = filters.minPrice;
        if (filters.maxPrice) where.price.lte = filters.maxPrice;
      }

      if (filters.status) {
        where.status = filters.status;
      }
      // Note: No status filter by default - admin sees ALL properties

      if (filters.dealerId) {
        where.dealerId = filters.dealerId;
      }

      // Additional filters for enhanced property search
      if (filters.bhk) {
        where.bhk = filters.bhk;
      }

      if (filters.furnishingStatus) {
        where.furnishingStatus = filters.furnishingStatus;
      }

      if (filters.parkingAvailable !== undefined) {
        where.parkingAvailable = filters.parkingAvailable;
      }

      if (filters.allowedTenants) {
        where.allowedTenants = filters.allowedTenants;
      }

      console.log('🔍 Admin properties query - where clause:', JSON.stringify(where, null, 2));
      
      // First, let's check the total count without any filters
      const totalCount = await prisma.property.count();
      console.log('🔍 Total properties in database (no filters):', totalCount);

      // Test with and without filters
      console.log('🔍 Testing with filters...');
      const [propertiesWithFilters, totalWithFilters] = await Promise.all([
        prisma.property.findMany({
          where,
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
          take: limit,
        }),
        prisma.property.count({ where }),
      ]);

      console.log('🔍 Properties with filters:', propertiesWithFilters.length);
      console.log('🔍 Total with filters:', totalWithFilters);

      // Also get all properties without filters for comparison
      console.log('🔍 Testing without filters...');
      const [propertiesWithoutFilters, totalWithoutFilters] = await Promise.all([
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
          take: limit,
        }),
        prisma.property.count(),
      ]);

      console.log('🔍 Properties without filters:', propertiesWithoutFilters.length);
      console.log('🔍 Total without filters:', totalWithoutFilters);

      // Use the results without filters for now
      const properties = propertiesWithoutFilters;
      const total = totalWithoutFilters;

      console.log('🔍 Admin properties query - found properties:', properties.length);
      console.log('🔍 Admin properties query - total count:', total);
      console.log('🔍 Admin properties query - property IDs:', properties.map(p => p.id));

      return {
        properties,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('❌ Error in getAllPropertiesForAdmin:', error);
      throw createError('Failed to fetch properties', 500);
    }
  }

  static async getPropertyById(id: string): Promise<Property | null> {
    try {
      return await prisma.property.findUnique({
        where: { id },
        include: {
          owner: true,
          dealer: {
            include: {
              user: true,
            },
          },
          bookings: {
            include: {
              user: true,
              payment: true,
            },
          },
        },
      });
    } catch (error) {
      throw createError('Failed to fetch property', 500);
    }
  }

  static async updateProperty(id: string, data: UpdatePropertyData, userId: string): Promise<Property> {
    try {
      const property = await prisma.property.findUnique({
        where: { id },
        include: { owner: true },
      });

      if (!property) {
        throw createError('Property not found', 404);
      }

      // Check if user is owner or admin
      if (property.ownerId !== userId) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user?.role !== 'ADMIN') {
          throw createError('Unauthorized to update this property', 403);
        }
      }

      // Handle media files if provided
      let mediaUrls = property.mediaUrls;
      
      // If mediaUrls is provided in the data, use it (this handles the frontend's image management)
      if (data.mediaUrls) {
        mediaUrls = data.mediaUrls;
      } else if (data.existingImageUrls || (data.mediaFiles && data.mediaFiles.length > 0)) {
        // Handle existing and new images
        let existingUrls: string[] = [];
        
        // Parse existing image URLs if provided
        if (data.existingImageUrls) {
          try {
            existingUrls = JSON.parse(data.existingImageUrls);
          } catch (e) {
            console.error('Error parsing existingImageUrls:', e);
            existingUrls = [];
          }
        }
        
        // Handle new file uploads
        let newUrls: string[] = [];
        if (data.mediaFiles && data.mediaFiles.length > 0) {
          const uploadResults = await Promise.all(
            data.mediaFiles.map(file => S3Uploader.uploadFile(file, 'properties'))
          );
          newUrls = uploadResults.map(result => typeof result === 'string' ? result : result.url);
        }
        
        // Combine existing and new URLs
        const allUrls = [...existingUrls, ...newUrls];
        mediaUrls = JSON.stringify(allUrls);
      }

      // Handle document file uploads
      let electricityBillUrl = property.electricityBillImage;
      let waterBillUrl = property.waterBillImage;
      let registryUrl = property.registryImage;

      // Handle electricity bill
      if (data.existingElectricityBillUrl) {
        electricityBillUrl = data.existingElectricityBillUrl;
      } else if (data.electricityBillImage && typeof data.electricityBillImage !== 'string') {
        const uploadResult = await S3Uploader.uploadDocument(data.electricityBillImage, 'documents');
        electricityBillUrl = uploadResult.url;
      } else if (typeof data.electricityBillImage === 'string') {
        electricityBillUrl = data.electricityBillImage;
      }

      // Handle water bill
      if (data.existingWaterBillUrl) {
        waterBillUrl = data.existingWaterBillUrl;
      } else if (data.waterBillImage && typeof data.waterBillImage !== 'string') {
        const uploadResult = await S3Uploader.uploadDocument(data.waterBillImage, 'documents');
        waterBillUrl = uploadResult.url;
      } else if (typeof data.waterBillImage === 'string') {
        waterBillUrl = data.waterBillImage;
      }

      // Handle registry documents
      console.log('🔍 Registry document handling:', {
        existingRegistryUrls: data.existingRegistryUrls,
        registryImage: data.registryImage,
        registryImageType: typeof data.registryImage,
        isArray: Array.isArray(data.registryImage),
        clearRegistry: (data as any).clearRegistry
      });
      
      // Parse existing registry URLs for debugging
      if (data.existingRegistryUrls) {
        try {
          const parsed = JSON.parse(data.existingRegistryUrls);
          console.log('🔍 Parsed existing registry URLs:', parsed);
        } catch (e) {
          console.log('🔍 Error parsing existing registry URLs:', e.message);
        }
      }

      if ((data as any).clearRegistry === 'true') {
        // Clear registry documents
        registryUrl = null;
      } else       if (data.existingRegistryUrls) {
        // Parse existing registry documents
        let existingRegistryUrls: string[] = [];
        try {
          existingRegistryUrls = JSON.parse(data.existingRegistryUrls);
        } catch (e) {
          console.error('Error parsing existingRegistryUrls:', e);
          existingRegistryUrls = [];
        }
        
        // Handle new registry documents if provided
        if (data.registryImage) {
          if (Array.isArray(data.registryImage)) {
            // Handle multiple registry files
            if (data.registryImage.length > 0) {
              const uploadPromises = data.registryImage.map(file => 
                S3Uploader.uploadDocument(file, 'documents')
              );
              const uploadResults = await Promise.all(uploadPromises);
              const newUrls = uploadResults.map(result => result.url);
              // Combine existing and new URLs
              registryUrl = JSON.stringify([...existingRegistryUrls, ...newUrls]);
            } else {
              // No new files, keep existing
              registryUrl = existingRegistryUrls.length > 0 ? JSON.stringify(existingRegistryUrls) : null;
            }
          } else if (typeof data.registryImage !== 'string') {
            // Handle single registry file
            const uploadResult = await S3Uploader.uploadDocument(data.registryImage, 'documents');
            // Combine existing and new URL
            registryUrl = JSON.stringify([...existingRegistryUrls, uploadResult.url]);
          } else {
            // Handle string URL - check if it's "[]" to clear registry
            if (data.registryImage === "[]") {
              registryUrl = null;
            } else {
              registryUrl = data.registryImage;
            }
          }
        } else {
          // No new registry documents, keep existing
          registryUrl = existingRegistryUrls.length > 0 ? JSON.stringify(existingRegistryUrls) : null;
        }
      } else if (data.registryImage) {
        if (Array.isArray(data.registryImage)) {
          // Handle multiple registry files
          if (data.registryImage.length > 0) {
            const uploadPromises = data.registryImage.map(file => 
              S3Uploader.uploadDocument(file, 'documents')
            );
            const uploadResults = await Promise.all(uploadPromises);
            const registryUrls = uploadResults.map(result => result.url);
            registryUrl = JSON.stringify(registryUrls);
          } else {
            // Empty array - set to null to clear registry
            registryUrl = null;
          }
        } else if (typeof data.registryImage !== 'string') {
          // Handle single registry file
          const uploadResult = await S3Uploader.uploadDocument(data.registryImage, 'documents');
          registryUrl = uploadResult.url;
        } else {
          // Handle string URL - check if it's "[]" to clear registry
          if (data.registryImage === "[]") {
            registryUrl = null;
          } else {
            registryUrl = data.registryImage;
          }
        }
      }

      // Handle other documents
      let otherDocumentsUrl = property.otherDocuments;
      console.log('🔍 Other documents handling:', {
        existingOtherDocuments: data.existingOtherDocuments,
        otherDocuments: data.otherDocuments,
        otherDocumentsType: typeof data.otherDocuments,
        isArray: Array.isArray(data.otherDocuments)
      });
      
      // Parse existing other documents for debugging
      if (data.existingOtherDocuments) {
        try {
          const parsed = JSON.parse(data.existingOtherDocuments);
          console.log('🔍 Parsed existing other documents:', parsed);
        } catch (e) {
          console.log('🔍 Error parsing existing other documents:', e.message);
        }
      }

      if (data.existingOtherDocuments) {
        // Parse existing documents
        let existingUrls: string[] = [];
        try {
          existingUrls = JSON.parse(data.existingOtherDocuments);
        } catch (e) {
          console.error('Error parsing existingOtherDocuments:', e);
          existingUrls = [];
        }
        
        // Handle new documents if provided
        if (data.otherDocuments) {
          if (Array.isArray(data.otherDocuments)) {
            // Handle multiple other document files
            if (data.otherDocuments.length > 0) {
              const uploadPromises = data.otherDocuments.map(file => 
                S3Uploader.uploadDocument(file, 'documents')
              );
              const uploadResults = await Promise.all(uploadPromises);
              const newUrls = uploadResults.map(result => result.url);
              // Combine existing and new URLs
              otherDocumentsUrl = JSON.stringify([...existingUrls, ...newUrls]);
            } else {
              // No new files, keep existing
              otherDocumentsUrl = existingUrls.length > 0 ? JSON.stringify(existingUrls) : null;
            }
          } else if (typeof data.otherDocuments !== 'string') {
            // Handle single other document file
            const uploadResult = await S3Uploader.uploadDocument(data.otherDocuments, 'documents');
            // Combine existing and new URL
            otherDocumentsUrl = JSON.stringify([...existingUrls, uploadResult.url]);
          } else {
            // Handle string URL - check if it's "[]" to clear other documents
            if (data.otherDocuments === "[]") {
              otherDocumentsUrl = null;
            } else {
              otherDocumentsUrl = data.otherDocuments;
            }
          }
        } else {
          // No new documents, keep existing
          otherDocumentsUrl = existingUrls.length > 0 ? JSON.stringify(existingUrls) : null;
        }
      } else if (data.otherDocuments) {
        if (Array.isArray(data.otherDocuments)) {
          // Handle multiple other document files
          if (data.otherDocuments.length > 0) {
            const uploadPromises = data.otherDocuments.map(file => 
              S3Uploader.uploadDocument(file, 'documents')
            );
            const uploadResults = await Promise.all(uploadPromises);
            const otherDocumentsUrls = uploadResults.map(result => result.url);
            otherDocumentsUrl = JSON.stringify(otherDocumentsUrls);
          } else {
            // Empty array - set to null to clear other documents
            otherDocumentsUrl = null;
          }
        } else if (typeof data.otherDocuments !== 'string') {
          // Handle single other document file
          const uploadResult = await S3Uploader.uploadDocument(data.otherDocuments, 'documents');
          otherDocumentsUrl = uploadResult.url;
        } else {
          // Handle string URL - check if it's "[]" to clear other documents
          if (data.otherDocuments === "[]") {
            otherDocumentsUrl = null;
          } else {
            otherDocumentsUrl = data.otherDocuments;
          }
        }
      }

      // Calculate booking charges if action or price changes
      let bookingCharges = property.bookingCharges;
      if (data.action || data.price || data.leaseDuration) {
        const newAction = data.action || property.action;
        const newPrice = data.price || property.price;
        const newLeaseDuration = data.leaseDuration || property.leaseDuration;
        bookingCharges = this.calculateBookingCharges(newAction, newPrice, newLeaseDuration);
      }

      // Prepare update data
      const updateData: any = { ...data };
      
      console.log('🔍 Document comparison:', {
        registryUrl,
        propertyRegistryImage: property.registryImage,
        registryUrlType: typeof registryUrl,
        propertyRegistryType: typeof property.registryImage,
        otherDocumentsUrl,
        propertyOtherDocuments: property.otherDocuments,
        otherDocumentsUrlType: typeof otherDocumentsUrl,
        propertyOtherDocumentsType: typeof property.otherDocuments
      });
      
      if (mediaUrls !== property.mediaUrls) {
        updateData.mediaUrls = mediaUrls;
      }
      if (bookingCharges !== property.bookingCharges) {
        updateData.bookingCharges = bookingCharges;
      }
      if (electricityBillUrl !== property.electricityBillImage) {
        updateData.electricityBillImage = electricityBillUrl;
      }
      if (waterBillUrl !== property.waterBillImage) {
        updateData.waterBillImage = waterBillUrl;
      }
      
      // Always update registry and other documents to ensure they're preserved
      updateData.registryImage = registryUrl;
      updateData.otherDocuments = otherDocumentsUrl;
      
      // Ensure registryImage is not an empty array
      if (updateData.registryImage && Array.isArray(updateData.registryImage) && updateData.registryImage.length === 0) {
        updateData.registryImage = null;
      }
      // Ensure otherDocuments is not an empty array
      if (updateData.otherDocuments && Array.isArray(updateData.otherDocuments) && updateData.otherDocuments.length === 0) {
        updateData.otherDocuments = null;
      }
      
      // Handle null values properly
      if (updateData.registryImage === null) {
        updateData.registryImage = null;
      }
      if (updateData.otherDocuments === null) {
        updateData.otherDocuments = null;
      }

      // Remove mediaFiles from update data as it's not a database field
      delete updateData.mediaFiles;
      
      // Remove the new fields that are not database fields
      delete updateData.existingImageUrls;
      delete updateData.existingElectricityBillUrl;
      delete updateData.existingWaterBillUrl;
      delete updateData.existingRegistryUrls;
      delete updateData.existingOtherDocuments;
      delete (updateData as any).clearRegistry;

      console.log('🔍 Final update data:', {
        registryImage: updateData.registryImage,
        registryImageType: typeof updateData.registryImage,
        isArray: Array.isArray(updateData.registryImage),
        length: Array.isArray(updateData.registryImage) ? updateData.registryImage.length : 'N/A',
        otherDocuments: updateData.otherDocuments,
        otherDocumentsType: typeof updateData.otherDocuments,
        otherDocumentsIsArray: Array.isArray(updateData.otherDocuments),
        otherDocumentsLength: Array.isArray(updateData.otherDocuments) ? updateData.otherDocuments.length : 'N/A'
      });

      const updatedProperty = await prisma.property.update({
        where: { id },
        data: updateData,
        include: {
          owner: true,
          dealer: {
            include: {
              user: true,
            },
          },
        },
      });

      // Send notification to admin about property update (temporarily disabled)
      /*
      try {
        const changes = Object.keys(data).filter(key => key !== 'mediaFiles');
        if (changes.length > 0) {
          await NotificationService.notifyPropertyUpdated(updatedProperty, updatedProperty.owner, changes);
        }
      } catch (notificationError) {
        console.error('Failed to send property updated notification:', notificationError);
        // Don't fail the property update if notification fails
      }
      */

      return updatedProperty;
    } catch (error) {
      console.error('Error updating property:', error);
      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }
      throw createError('Failed to update property', 500);
    }
  }

  static async deleteProperty(id: string, userId: string): Promise<void> {
    try {
      const property = await prisma.property.findUnique({
        where: { id },
        include: { 
          owner: true,
          bookings: true,
          commissions: true
        },
      });

      if (!property) {
        throw createError('Property not found', 404);
      }

      // Check if user is owner or admin
      if (property.ownerId !== userId) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user?.role !== 'ADMIN') {
          throw createError('Unauthorized to delete this property', 403);
        }
      }

      // Delete media files from S3
      try {
        const mediaUrlsArray = JSON.parse(property.mediaUrls || '[]');
        if (mediaUrlsArray.length > 0) {
          const keys = mediaUrlsArray.map((url: string) => S3Uploader.extractKeyFromUrl(url)).filter(Boolean);
          if (keys.length > 0) {
            await S3Uploader.deleteMultipleFiles(keys);
          }
        }
      } catch (e) {
        console.error('Error parsing mediaUrls for deletion:', e);
      }

      // Delete related data in a transaction
      await prisma.$transaction(async (tx) => {
        // Delete related commissions
        await tx.commission.deleteMany({
          where: { propertyId: id }
        });

        // Delete related bookings (and their payments)
        for (const booking of property.bookings) {
          await tx.payment.deleteMany({
            where: { bookingId: booking.id }
          });
        }
        
        await tx.booking.deleteMany({
          where: { propertyId: id }
        });

        // Finally delete the property
        await tx.property.delete({
          where: { id }
        });
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }
      throw createError('Failed to delete property', 500);
    }
  }

  static async updatePropertyStatus(id: string, status: string, userId: string): Promise<Property> {
    try {
      const property = await prisma.property.findUnique({
        where: { id },
      });

      if (!property) {
        throw createError('Property not found', 404);
      }

      // Only admin can update status
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.role !== 'ADMIN') {
        throw createError('Only admin can update property status', 403);
      }

      return await prisma.property.update({
        where: { id },
        data: { status },
        include: {
          owner: true,
          dealer: {
            include: {
              user: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }
      throw createError('Failed to update property status', 500);
    }
  }

  static async getPropertyTypes(): Promise<string[]> {
    try {
      const types = await prisma.property.findMany({
        select: { type: true },
        distinct: ['type'],
      });

      return types.map(t => t.type);
    } catch (error) {
      console.error('Error fetching property types:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        meta: error.meta
      });
      throw createError(`Failed to fetch property types: ${error.message}`, 500);
    }
  }

  static async getLocations(): Promise<string[]> {
    try {
      const locations = await prisma.property.findMany({
        select: { location: true },
        distinct: ['location'],
        where: {
          location: { not: null }
        }
      });

      return locations.map(l => l.location).filter((loc): loc is string => loc !== null);
    } catch (error) {
      console.error('Error fetching locations:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        meta: error.meta
      });
      throw createError(`Failed to fetch locations: ${error.message}`, 500);
    }
  }
} 