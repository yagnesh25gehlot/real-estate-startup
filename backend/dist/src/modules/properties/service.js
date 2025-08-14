"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyService = void 0;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../../utils/errorHandler");
const s3Uploader_1 = require("../../utils/s3Uploader");
const service_1 = require("../notification/service");
const prisma = new client_1.PrismaClient();
class PropertyService {
    static async createProperty(data, ownerId) {
        try {
            let mediaUrls = [];
            if (data.mediaFiles && data.mediaFiles.length > 0) {
                const uploadResults = await s3Uploader_1.S3Uploader.uploadMultipleFiles(data.mediaFiles);
                mediaUrls = uploadResults.map(result => result.url);
            }
            const property = await prisma.property.create({
                data: {
                    title: data.title,
                    description: data.description,
                    type: data.type,
                    location: data.location,
                    address: data.address || '',
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
            try {
                const owner = await prisma.user.findUnique({ where: { id: property.ownerId } });
                if (owner) {
                    await service_1.NotificationService.notifyPropertyAdded(property, owner);
                }
            }
            catch (notificationError) {
                console.error('Failed to send property added notification:', notificationError);
            }
            return property;
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to create property', 500);
        }
    }
    static async getProperties(filters = {}, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const where = {};
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
                if (filters.minPrice)
                    where.price.gte = filters.minPrice;
                if (filters.maxPrice)
                    where.price.lte = filters.maxPrice;
            }
            if (filters.status) {
                where.status = filters.status;
            }
            else {
                where.status = { not: 'SOLD' };
            }
            if (filters.dealerId) {
                where.dealerId = filters.dealerId;
            }
            if (filters.ownerId) {
                where.ownerId = filters.ownerId;
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
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch properties', 500);
        }
    }
    static async getAllPropertiesForAdmin(filters = {}, page = 1, limit = 100) {
        try {
            const skip = (page - 1) * limit;
            const where = {};
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
                if (filters.minPrice)
                    where.price.gte = filters.minPrice;
                if (filters.maxPrice)
                    where.price.lte = filters.maxPrice;
            }
            if (filters.status) {
                where.status = filters.status;
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
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch properties', 500);
        }
    }
    static async getPropertyById(id) {
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
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch property', 500);
        }
    }
    static async updateProperty(id, data, userId) {
        try {
            const property = await prisma.property.findUnique({
                where: { id },
                include: { owner: true },
            });
            if (!property) {
                throw (0, errorHandler_1.createError)('Property not found', 404);
            }
            if (property.ownerId !== userId) {
                const user = await prisma.user.findUnique({ where: { id: userId } });
                if (user?.role !== 'ADMIN') {
                    throw (0, errorHandler_1.createError)('Unauthorized to update this property', 403);
                }
            }
            let mediaUrls = property.mediaUrls;
            if (data.mediaFiles && data.mediaFiles.length > 0) {
                const uploadResults = await Promise.all(data.mediaFiles.map(file => s3Uploader_1.S3Uploader.uploadFile(file, 'properties')));
                const newUrls = uploadResults.map(result => typeof result === 'string' ? result : result.url);
                mediaUrls = [...mediaUrls, ...newUrls];
            }
            const updateData = { ...data };
            if (mediaUrls !== property.mediaUrls) {
                updateData.mediaUrls = mediaUrls;
            }
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
            try {
                const changes = Object.keys(data).filter(key => key !== 'mediaFiles');
                if (changes.length > 0) {
                    await service_1.NotificationService.notifyPropertyUpdated(updatedProperty, updatedProperty.owner, changes);
                }
            }
            catch (notificationError) {
                console.error('Failed to send property updated notification:', notificationError);
            }
            return updatedProperty;
        }
        catch (error) {
            console.error('Error updating property:', error);
            if (error instanceof Error && error.message.includes('not found')) {
                throw error;
            }
            throw (0, errorHandler_1.createError)('Failed to update property', 500);
        }
    }
    static async deleteProperty(id, userId) {
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
                throw (0, errorHandler_1.createError)('Property not found', 404);
            }
            if (property.ownerId !== userId) {
                const user = await prisma.user.findUnique({ where: { id: userId } });
                if (user?.role !== 'ADMIN') {
                    throw (0, errorHandler_1.createError)('Unauthorized to delete this property', 403);
                }
            }
            if (property.mediaUrls.length > 0) {
                const keys = property.mediaUrls.map(url => s3Uploader_1.S3Uploader.extractKeyFromUrl(url)).filter(Boolean);
                if (keys.length > 0) {
                    await s3Uploader_1.S3Uploader.deleteMultipleFiles(keys);
                }
            }
            await prisma.$transaction(async (tx) => {
                await tx.commission.deleteMany({
                    where: { propertyId: id }
                });
                for (const booking of property.bookings) {
                    await tx.payment.deleteMany({
                        where: { bookingId: booking.id }
                    });
                }
                await tx.booking.deleteMany({
                    where: { propertyId: id }
                });
                await tx.property.delete({
                    where: { id }
                });
            });
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('not found')) {
                throw error;
            }
            throw (0, errorHandler_1.createError)('Failed to delete property', 500);
        }
    }
    static async updatePropertyStatus(id, status, userId) {
        try {
            const property = await prisma.property.findUnique({
                where: { id },
            });
            if (!property) {
                throw (0, errorHandler_1.createError)('Property not found', 404);
            }
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (user?.role !== 'ADMIN') {
                throw (0, errorHandler_1.createError)('Only admin can update property status', 403);
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
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('not found')) {
                throw error;
            }
            throw (0, errorHandler_1.createError)('Failed to update property status', 500);
        }
    }
    static async getPropertyTypes() {
        try {
            const types = await prisma.property.findMany({
                select: { type: true },
                distinct: ['type'],
            });
            return types.map(t => t.type);
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch property types', 500);
        }
    }
    static async getLocations() {
        try {
            const locations = await prisma.property.findMany({
                select: { location: true },
                distinct: ['location'],
                where: {
                    location: { not: null }
                }
            });
            return locations.map(l => l.location).filter((loc) => loc !== null);
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch locations', 500);
        }
    }
}
exports.PropertyService = PropertyService;
//# sourceMappingURL=service.js.map