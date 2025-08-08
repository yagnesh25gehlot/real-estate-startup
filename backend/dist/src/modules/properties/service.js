"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyService = void 0;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../../utils/errorHandler");
const s3Uploader_1 = require("../../utils/s3Uploader");
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
                const uploadResults = await s3Uploader_1.S3Uploader.uploadMultipleFiles(data.mediaFiles);
                const newUrls = uploadResults.map(result => result.url);
                mediaUrls = [...mediaUrls, ...newUrls];
            }
            return await prisma.property.update({
                where: { id },
                data: {
                    ...data,
                    mediaUrls,
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
        }
        catch (error) {
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
                include: { owner: true },
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
            await prisma.property.delete({
                where: { id },
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
            });
            return locations.map(l => l.location);
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch locations', 500);
        }
    }
}
exports.PropertyService = PropertyService;
//# sourceMappingURL=service.js.map