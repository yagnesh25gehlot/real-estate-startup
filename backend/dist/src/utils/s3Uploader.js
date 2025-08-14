"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Uploader = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const errorHandler_1 = require("./errorHandler");
let s3 = null;
let BUCKET_NAME = null;
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_REGION && process.env.AWS_S3_BUCKET) {
    aws_sdk_1.default.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
    });
    s3 = new aws_sdk_1.default.S3();
    BUCKET_NAME = process.env.AWS_S3_BUCKET;
}
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILE_SIZE_AADHAAR = 5 * 1024 * 1024;
class S3Uploader {
    static validateFile(file, allowedTypes = ALLOWED_IMAGE_TYPES, maxSize = MAX_FILE_SIZE) {
        if (!file) {
            throw (0, errorHandler_1.createError)('No file provided', 400);
        }
        if (!allowedTypes.includes(file.mimetype)) {
            throw (0, errorHandler_1.createError)(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`, 400);
        }
        if (file.size > maxSize) {
            throw (0, errorHandler_1.createError)(`File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`, 400);
        }
        if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
            throw (0, errorHandler_1.createError)('Invalid filename', 400);
        }
    }
    static validateImage(file) {
        this.validateFile(file, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE);
    }
    static validateDocument(file) {
        this.validateFile(file, ALLOWED_DOCUMENT_TYPES, MAX_FILE_SIZE_AADHAAR);
    }
    static async uploadFile(file, folder = 'general') {
        try {
            this.validateImage(file);
            const key = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}-${file.originalname}`;
            if (s3 && BUCKET_NAME) {
                const result = await s3.upload({
                    Bucket: BUCKET_NAME,
                    Key: key,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                    ACL: 'public-read',
                    Metadata: {
                        originalName: file.originalname,
                        uploadedAt: new Date().toISOString(),
                    }
                }).promise();
                return {
                    url: result.Location,
                    key: result.Key,
                };
            }
            else {
                return await this.uploadFileLocally(file, folder);
            }
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('File upload failed', 500);
        }
    }
    static async uploadFileLocally(file, folder = 'general') {
        try {
            const uploadDir = path_1.default.join(process.cwd(), 'uploads', folder);
            if (!fs_1.default.existsSync(uploadDir)) {
                fs_1.default.mkdirSync(uploadDir, { recursive: true });
            }
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}-${file.originalname}`;
            const filePath = path_1.default.join(uploadDir, fileName);
            const relativePath = path_1.default.join(folder, fileName);
            fs_1.default.writeFileSync(filePath, file.buffer);
            return {
                url: `/uploads/${relativePath}`,
                key: relativePath,
            };
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Local file upload failed', 500);
        }
    }
    static async uploadMultipleFiles(files, folder = 'general') {
        const uploadPromises = files.map(file => this.uploadFile(file, folder));
        return Promise.all(uploadPromises);
    }
    static async deleteFile(key) {
        try {
            if (s3 && BUCKET_NAME) {
                await s3.deleteObject({
                    Bucket: BUCKET_NAME,
                    Key: key,
                }).promise();
            }
            else {
                await this.deleteFileLocally(key);
            }
        }
        catch (error) {
            if (process.env.NODE_ENV !== 'production') {
                console.error('Failed to delete file:', key, error);
            }
        }
    }
    static async deleteFileLocally(key) {
        try {
            const filePath = path_1.default.join(process.cwd(), 'uploads', key);
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
        }
        catch (error) {
            if (process.env.NODE_ENV !== 'production') {
                console.error('Failed to delete local file:', key, error);
            }
        }
    }
    static async deleteMultipleFiles(keys) {
        const deletePromises = keys.map(key => this.deleteFile(key));
        await Promise.all(deletePromises);
    }
    static getFileUrl(key) {
        if (s3 && BUCKET_NAME && process.env.AWS_REGION) {
            return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
        }
        return `/uploads/${key}`;
    }
    static extractKeyFromUrl(url) {
        if (!url)
            return '';
        if (url.includes('amazonaws.com')) {
            const urlParts = url.split('.com/');
            return urlParts[1] || '';
        }
        else {
            const urlParts = url.split('/uploads/');
            return urlParts[1] || '';
        }
    }
}
exports.S3Uploader = S3Uploader;
//# sourceMappingURL=s3Uploader.js.map