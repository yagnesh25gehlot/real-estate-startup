import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './types';
export declare const authMiddleware: (allowedRoles?: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const optionalAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=middleware.d.ts.map