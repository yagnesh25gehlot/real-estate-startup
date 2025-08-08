import { User } from '@prisma/client';
import { GoogleAuthPayload, LoginResponse, DealerSignupRequest } from './types';
export declare class AuthService {
    static generateToken(user: User): string;
    static googleAuth(payload: GoogleAuthPayload): Promise<LoginResponse>;
    static dealerSignup(request: DealerSignupRequest): Promise<{
        message: string;
    }>;
    static approveDealer(dealerId: string): Promise<{
        message: string;
    }>;
    static getDealerHierarchy(dealerId: string): Promise<any>;
    private static generateReferralCode;
}
//# sourceMappingURL=service.d.ts.map