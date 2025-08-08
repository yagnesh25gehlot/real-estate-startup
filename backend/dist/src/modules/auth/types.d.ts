import { Request } from 'express';
import { User, Role } from '@prisma/client';
export interface AuthenticatedRequest extends Request {
    user?: User;
}
export interface GoogleAuthPayload {
    email: string;
    name: string;
    picture?: string;
    role?: Role;
}
export interface JwtPayload {
    userId: string;
    email: string;
    role: Role;
    iat?: number;
    exp?: number;
}
export interface LoginResponse {
    user: {
        id: string;
        email: string;
        name: string | null;
        role: Role;
    };
    token: string;
}
export interface DealerSignupRequest {
    email: string;
    name: string;
    referralCode?: string;
    parentId?: string;
}
//# sourceMappingURL=types.d.ts.map