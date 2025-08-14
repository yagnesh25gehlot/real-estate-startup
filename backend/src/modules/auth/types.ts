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
    mobile?: string | null;
    aadhaar?: string | null;
    aadhaarImage?: string | null;
    profilePic?: string | null;
    role: Role;
    createdAt: Date;
    dealer?: {
      id: string;
      referralCode: string;
      status: string;
    } | null;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface DealerSignupRequest {
  email: string;
  name: string;
  referralCode?: string;
  parentId?: string;
} 