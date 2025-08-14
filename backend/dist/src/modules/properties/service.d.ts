import { Property } from '@prisma/client';
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
    ownerId?: string;
}
export declare class PropertyService {
    static createProperty(data: CreatePropertyData, ownerId: string): Promise<Property>;
    static getProperties(filters?: PropertyFilters, page?: number, limit?: number): Promise<{
        properties: ({
            dealer: ({
                user: {
                    name: string | null;
                    id: string;
                    email: string;
                    password: string | null;
                    mobile: string | null;
                    aadhaar: string | null;
                    aadhaarImage: string | null;
                    profilePic: string | null;
                    role: string;
                    status: string;
                    createdAt: Date;
                };
            } & {
                id: string;
                status: string;
                createdAt: Date;
                userId: string;
                parentId: string | null;
                commission: number;
                referralCode: string;
            }) | null;
            owner: {
                name: string | null;
                id: string;
                email: string;
                password: string | null;
                mobile: string | null;
                aadhaar: string | null;
                aadhaarImage: string | null;
                profilePic: string | null;
                role: string;
                status: string;
                createdAt: Date;
            };
        } & {
            id: string;
            status: string;
            createdAt: Date;
            type: string;
            title: string;
            dealerId: string | null;
            description: string;
            location: string | null;
            address: string;
            latitude: number | null;
            longitude: number | null;
            price: number;
            mediaUrls: string;
            ownerId: string;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    static getAllPropertiesForAdmin(filters?: PropertyFilters, page?: number, limit?: number): Promise<{
        properties: ({
            dealer: ({
                user: {
                    name: string | null;
                    id: string;
                    email: string;
                    password: string | null;
                    mobile: string | null;
                    aadhaar: string | null;
                    aadhaarImage: string | null;
                    profilePic: string | null;
                    role: string;
                    status: string;
                    createdAt: Date;
                };
            } & {
                id: string;
                status: string;
                createdAt: Date;
                userId: string;
                parentId: string | null;
                commission: number;
                referralCode: string;
            }) | null;
            owner: {
                name: string | null;
                id: string;
                email: string;
                password: string | null;
                mobile: string | null;
                aadhaar: string | null;
                aadhaarImage: string | null;
                profilePic: string | null;
                role: string;
                status: string;
                createdAt: Date;
            };
        } & {
            id: string;
            status: string;
            createdAt: Date;
            type: string;
            title: string;
            dealerId: string | null;
            description: string;
            location: string | null;
            address: string;
            latitude: number | null;
            longitude: number | null;
            price: number;
            mediaUrls: string;
            ownerId: string;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    static getPropertyById(id: string): Promise<Property | null>;
    static updateProperty(id: string, data: UpdatePropertyData, userId: string): Promise<Property>;
    static deleteProperty(id: string, userId: string): Promise<void>;
    static updatePropertyStatus(id: string, status: string, userId: string): Promise<Property>;
    static getPropertyTypes(): Promise<string[]>;
    static getLocations(): Promise<string[]>;
}
//# sourceMappingURL=service.d.ts.map