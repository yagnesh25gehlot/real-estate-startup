import { PrismaClient, Property, User } from '@prisma/client';
import { createError } from '../../utils/errorHandler';
import { S3Uploader } from '../../utils/s3Uploader';
import { NotificationService } from '../notification/service';

const prisma = new PrismaClient();

export interface CreatePropertyData {
  title: string;
  description: string;
  type: string;
  location: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  price: number;
  mediaFiles?: Express.Multer.File[];
  dealerId?: string;
}

export interface UpdatePropertyData {
  title?: string;
  description?: string;
  type?: string;
  location?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  price?: number;
  status?: string;
  mediaFiles?: Express.Multer.File[];
}

export interface PropertyFilters {
  type?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  dealerId?: string;
}

export class PropertyService {
  static async createProperty(data: CreatePropertyData, ownerId: string): Promise<Property> {
    try {
      let mediaUrls: string[] = [];

      // Upload media files to S3
      if (data.mediaFiles && data.mediaFiles.length > 0) {
        const uploadResults = await S3Uploader.uploadMultipleFiles(data.mediaFiles);
        mediaUrls = uploadResults.map(result => result.url);
      }

      const property = await prisma.property.create({
        data: {
          title: data.title,
          description: data.description,
          type: data.type,
          location: data.location,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          price: data.price,
          mediaUrls,
          ownerId,
          dealerId: data.dealerId,
        },
        include: {
          owner: true,
          dealer: {
            include: {
              user: true,
            },
          },
        },
      });

      // Send notification to admin
      try {
        await NotificationService.notifyPropertyAdded(property, property.owner);
      } catch (notificationError) {
        console.error('Failed to send property added notification:', notificationError);
        // Don't fail the property creation if notification fails
      }

      return property;
    } catch (error) {
      throw createError('Failed to create property', 500);
    }
  }

  static async getProperties(filters: PropertyFilters = {}, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const where: any = {};

      if (filters.type) {
        where.type = filters.type;
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

      const [properties, total] = await Promise.all([
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
      throw createError('Failed to fetch properties', 500);
    }
  }

  static async getAllPropertiesForAdmin(filters: PropertyFilters = {}, page: number = 1, limit: number = 100) {
    try {
      const skip = (page - 1) * limit;
      
      const where: any = {};

      if (filters.type) {
        where.type = filters.type;
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

      const [properties, total] = await Promise.all([
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
      if (data.mediaFiles && data.mediaFiles.length > 0) {
        const uploadResults = await Promise.all(
          data.mediaFiles.map(file => S3Uploader.uploadFile(file, 'properties'))
        );
        const newUrls = uploadResults.map(result => typeof result === 'string' ? result : result.url);
        mediaUrls = [...mediaUrls, ...newUrls];
      }

      // Prepare update data
      const updateData: any = { ...data };
      if (mediaUrls !== property.mediaUrls) {
        updateData.mediaUrls = mediaUrls;
      }

      // Remove mediaFiles from update data as it's not a database field
      delete updateData.mediaFiles;

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

      // Send notification to admin about property update
      try {
        const changes = Object.keys(data).filter(key => key !== 'mediaFiles');
        if (changes.length > 0) {
          await NotificationService.notifyPropertyUpdated(updatedProperty, updatedProperty.owner, changes);
        }
      } catch (notificationError) {
        console.error('Failed to send property updated notification:', notificationError);
        // Don't fail the property update if notification fails
      }

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
        include: { owner: true },
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
      if (property.mediaUrls.length > 0) {
        const keys = property.mediaUrls.map(url => S3Uploader.extractKeyFromUrl(url)).filter(Boolean);
        if (keys.length > 0) {
          await S3Uploader.deleteMultipleFiles(keys);
        }
      }

      await prisma.property.delete({
        where: { id },
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
      throw createError('Failed to fetch property types', 500);
    }
  }

  static async getLocations(): Promise<string[]> {
    try {
      const locations = await prisma.property.findMany({
        select: { location: true },
        distinct: ['location'],
      });

      return locations.map(l => l.location);
    } catch (error) {
      throw createError('Failed to fetch locations', 500);
    }
  }
} 