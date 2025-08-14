export interface UploadResult {
    url: string;
    key: string;
}
export declare class S3Uploader {
    static validateFile(file: Express.Multer.File, allowedTypes?: string[], maxSize?: number): void;
    static validateImage(file: Express.Multer.File): void;
    static validateDocument(file: Express.Multer.File): void;
    static uploadFile(file: Express.Multer.File, folder?: string): Promise<UploadResult>;
    static uploadFileLocally(file: Express.Multer.File, folder?: string): Promise<UploadResult>;
    static uploadMultipleFiles(files: Express.Multer.File[], folder?: string): Promise<UploadResult[]>;
    static deleteFile(key: string): Promise<void>;
    static deleteFileLocally(key: string): Promise<void>;
    static deleteMultipleFiles(keys: string[]): Promise<void>;
    static getFileUrl(key: string): string;
    static extractKeyFromUrl(url: string): string;
}
//# sourceMappingURL=s3Uploader.d.ts.map