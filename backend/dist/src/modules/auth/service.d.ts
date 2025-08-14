import { User } from '@prisma/client';
import { GoogleAuthPayload, LoginResponse, DealerSignupRequest, LoginRequest } from './types';
export declare class AuthService {
    static generateToken(user: User): string;
    static generateRefreshToken(user: User): string;
    static verifyToken(token: string): any;
    private static validatePassword;
    static signup(request: {
        email: string;
        name: string;
        password: string;
        mobile?: string;
        aadhaar?: string;
        aadhaarImage?: string;
    }): Promise<{
        user: any;
    }>;
    static login(request: LoginRequest): Promise<{
        user: any;
    }>;
    static googleAuth(payload: GoogleAuthPayload): Promise<LoginResponse>;
    static dealerSignup(request: DealerSignupRequest & {
        password: string;
        mobile?: string;
        aadhaar?: string;
        aadhaarImage?: string;
    }): Promise<{
        message: string;
    }>;
    static applyForDealer(userId: string, request: {
        referralCode?: string;
    }): Promise<{
        message: string;
    }>;
    static updateProfile(userId: string, data: {
        name: string;
        mobile?: string;
        aadhaar?: string;
        profilePic?: string;
    }): Promise<{
        user: any;
    }>;
    static updateProfilePicture(userId: string, profilePicUrl: string): Promise<{
        message: string;
    }>;
    static updateAadhaarImage(userId: string, aadhaarImageUrl: string): Promise<{
        message: string;
    }>;
    static getUserProfile(userId: string): Promise<any>;
    static changePassword(userId: string, data: {
        currentPassword: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
    static approveDealer(dealerId: string): Promise<{
        message: string;
    }>;
    static rejectDealer(dealerId: string): Promise<{
        message: string;
    }>;
    static getDealerHierarchy(dealerId: string): Promise<any>;
    static checkDealerAccess(userId: string): Promise<boolean>;
    private static generateReferralCode;
}
//# sourceMappingURL=service.d.ts.map