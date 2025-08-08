"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Uploader = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
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
class S3Uploader {
    static async uploadFile(file, folder = 'properties') {
        try {
            if (!s3 || !BUCKET_NAME) {
                console.log('⚠️ S3 not configured, skipping file upload');
                return {
                    url: `https://example.com/mock-upload/${folder}/${Date.now()}-${file.originalname}`,
                    key: `${folder}/${Date.now()}-${file.originalname}`,
                };
            }
            const key = `${folder}/${Date.now()}-${file.originalname}`;
            const params = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
                ACL: 'public-read',
            };
            const result = await s3.upload(params).promise();
            return {
                url: result.Location,
                key: result.Key,
            };
        }
        catch (error) {
            console.error('S3 upload error:', error);
            throw (0, errorHandler_1.createError)('Failed to upload file to S3', 500);
        }
    }
    static async uploadMultipleFiles(files, folder = 'properties') {
        try {
            const uploadPromises = files.map(file => this.uploadFile(file, folder));
            return await Promise.all(uploadPromises);
        }
        catch (error) {
            console.error('Multiple S3 upload error:', error);
            throw (0, errorHandler_1.createError)('Failed to upload files to S3', 500);
        }
    }
    static async deleteFile(key) {
        try {
            if (!s3 || !BUCKET_NAME) {
                console.log('⚠️ S3 not configured, skipping file deletion');
                return;
            }
            const params = {
                Bucket: BUCKET_NAME,
                Key: key,
            };
            await s3.deleteObject(params).promise();
            console.log(`✅ File deleted from S3: ${key}`);
        }
        catch (error) {
            console.error('S3 delete error:', error);
            throw (0, errorHandler_1.createError)('Failed to delete file from S3', 500);
        }
    }
    static async deleteMultipleFiles(keys) {
        try {
            const deletePromises = keys.map(key => this.deleteFile(key));
            await Promise.all(deletePromises);
        }
        catch (error) {
            console.error('Multiple S3 delete error:', error);
            throw (0, errorHandler_1.createError)('Failed to delete files from S3', 500);
        }
    }
    static getFileUrl(key) {
        if (!BUCKET_NAME || !process.env.AWS_REGION) {
            return `https://example.com/mock-upload/${key}`;
        }
        return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    }
    static extractKeyFromUrl(url) {
        if (!BUCKET_NAME || !process.env.AWS_REGION) {
            const mockPattern = /https:\/\/example\.com\/mock-upload\/(.+)/;
            const mockMatch = url.match(mockPattern);
            return mockMatch ? mockMatch[1] : '';
        }
        const bucketName = BUCKET_NAME;
        const region = process.env.AWS_REGION;
        const pattern = new RegExp(`https://${bucketName}\\.s3\\.${region}\\.amazonaws\\.com/(.+)`);
        const match = url.match(pattern);
        return match ? match[1] : '';
    }
}
exports.S3Uploader = S3Uploader;
//# sourceMappingURL=s3Uploader.js.map