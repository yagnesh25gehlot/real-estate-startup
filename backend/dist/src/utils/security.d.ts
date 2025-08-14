import { Request } from 'express';
export declare class SecurityUtils {
    static validateEmail(email: string): string;
    static validatePassword(password: string): string;
    static validateName(name: string): string;
    static validateMobile(mobile: string): string;
    static validateAadhaar(aadhaar: string): string;
    static validatePropertyData(data: any): any;
    static sanitizeRequestBody(req: Request): void;
    static validateFileUpload(file: Express.Multer.File, maxSize?: number): void;
    static getClientIP(req: Request): string;
    static generateSecureToken(length?: number): string;
    static validateURL(url: string): string;
}
//# sourceMappingURL=security.d.ts.map