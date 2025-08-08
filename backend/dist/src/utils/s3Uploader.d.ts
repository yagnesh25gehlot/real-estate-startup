export interface UploadResult {
    url: string;
    key: string;
}
export declare class S3Uploader {
    static uploadFile(file: Express.Multer.File, folder?: string): Promise<UploadResult>;
    static uploadMultipleFiles(files: Express.Multer.File[], folder?: string): Promise<UploadResult[]>;
    static deleteFile(key: string): Promise<void>;
    static deleteMultipleFiles(keys: string[]): Promise<void>;
    static getFileUrl(key: string): string;
    static extractKeyFromUrl(url: string): string;
}
//# sourceMappingURL=s3Uploader.d.ts.map