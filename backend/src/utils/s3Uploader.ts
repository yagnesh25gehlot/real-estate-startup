import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import { createError } from './errorHandler';

let s3: AWS.S3 | null = null;
let BUCKET_NAME: string | null = null;

// Configure AWS only if credentials are available
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_REGION && process.env.AWS_S3_BUCKET) {
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    httpOptions: {
      timeout: 300000, // 5 minutes timeout for S3 operations
      connectTimeout: 60000, // 1 minute connection timeout
    },
  });
  
  s3 = new AWS.S3({
    httpOptions: {
      timeout: 300000, // 5 minutes timeout for S3 operations
      connectTimeout: 60000, // 1 minute connection timeout
    },
  });
  BUCKET_NAME = process.env.AWS_S3_BUCKET;
}

export interface UploadResult {
  url: string;
  key: string;
}

// File validation constants
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILE_SIZE_AADHAAR = 5 * 1024 * 1024; // 5MB for Aadhaar documents

export class S3Uploader {
  // Validate file type and size
  static validateFile(file: Express.Multer.File, allowedTypes: string[] = ALLOWED_IMAGE_TYPES, maxSize: number = MAX_FILE_SIZE): void {
    if (!file) {
      throw createError('No file provided', 400);
    }

    if (!allowedTypes.includes(file.mimetype)) {
      throw createError(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`, 400);
    }

    if (file.size > maxSize) {
      throw createError(`File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`, 400);
    }

    // Additional security checks
    if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
      throw createError('Invalid filename', 400);
    }
  }

  // Validate image specifically
  static validateImage(file: Express.Multer.File): void {
    this.validateFile(file, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE);
  }

  // Validate document (Aadhaar, etc.)
  static validateDocument(file: Express.Multer.File): void {
    this.validateFile(file, ALLOWED_DOCUMENT_TYPES, MAX_FILE_SIZE_AADHAAR);
  }

  static async uploadFile(file: Express.Multer.File, folder: string = 'general'): Promise<UploadResult> {
    try {
      // Validate file before upload
      this.validateImage(file);

      const key = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}-${file.originalname}`;

      if (s3 && BUCKET_NAME) {
        try {
          console.log(`📤 Uploading file to S3: ${file.originalname} (${file.size} bytes)`);
          // Upload to S3
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

          console.log(`✅ File uploaded to S3 successfully: ${result.Location}`);
          return {
            url: result.Location,
            key: result.Key,
          };
        } catch (s3Error) {
          console.error('❌ S3 upload failed, falling back to local storage:', s3Error);
          // Fallback to local storage if S3 fails
          return await this.uploadFileLocally(file, folder);
        }
      } else {
        // Fallback to local storage
        return await this.uploadFileLocally(file, folder);
      }
    } catch (error) {
      throw createError('File upload failed', 500);
    }
  }

  static async uploadDocument(file: Express.Multer.File, folder: string = 'documents'): Promise<UploadResult> {
    try {
      // Validate document before upload
      this.validateDocument(file);

      const key = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}-${file.originalname}`;

      if (s3 && BUCKET_NAME) {
        try {
          console.log(`📤 Uploading document to S3: ${file.originalname} (${file.size} bytes)`);
          // Upload to S3
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

          console.log(`✅ Document uploaded to S3 successfully: ${result.Location}`);
          return {
            url: result.Location,
            key: result.Key,
          };
        } catch (s3Error) {
          console.error('❌ S3 upload failed, falling back to local storage:', s3Error);
          // Fallback to local storage if S3 fails
          return await this.uploadFileLocally(file, folder);
        }
      } else {
        // Fallback to local storage
        return await this.uploadFileLocally(file, folder);
      }
    } catch (error) {
      throw createError('Document upload failed', 500);
    }
  }

  static async uploadFileLocally(file: Express.Multer.File, folder: string = 'general'): Promise<UploadResult> {
    try {
      const uploadDir = path.join(process.cwd(), 'uploads', folder);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}-${file.originalname}`;
      const filePath = path.join(uploadDir, fileName);
      const relativePath = path.join(folder, fileName);

      // Write file
      fs.writeFileSync(filePath, file.buffer);

      return {
        url: `/uploads/${relativePath}`,
        key: relativePath,
      };
    } catch (error) {
      throw createError('Local file upload failed', 500);
    }
  }

  static async uploadMultipleFiles(files: Express.Multer.File[], folder: string = 'general'): Promise<UploadResult[]> {
    console.log(`📤 Starting upload of ${files.length} files to folder: ${folder}`);
    const uploadPromises = files.map(file => this.uploadFile(file, folder));
    const results = await Promise.all(uploadPromises);
    console.log(`✅ Successfully uploaded ${results.length} files`);
    return results;
  }

  static async deleteFile(key: string): Promise<void> {
    try {
      if (s3 && BUCKET_NAME) {
        await s3.deleteObject({
          Bucket: BUCKET_NAME,
          Key: key,
        }).promise();
      } else {
        await this.deleteFileLocally(key);
      }
    } catch (error) {
      // Log error but don't throw to avoid breaking the application
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to delete file:', key, error);
      }
    }
  }

  static async deleteFileLocally(key: string): Promise<void> {
    try {
      const filePath = path.join(process.cwd(), 'uploads', key);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to delete local file:', key, error);
      }
    }
  }

  static async deleteMultipleFiles(keys: string[]): Promise<void> {
    const deletePromises = keys.map(key => this.deleteFile(key));
    await Promise.all(deletePromises);
  }

  static getFileUrl(key: string): string {
    if (s3 && BUCKET_NAME && process.env.AWS_REGION) {
      return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    }
    return `/uploads/${key}`;
  }

  static extractKeyFromUrl(url: string): string {
    if (!url) return '';
    
    if (url.includes('amazonaws.com')) {
      // S3 URL
      const urlParts = url.split('.com/');
      return urlParts[1] || '';
    } else {
      // Local URL
      const urlParts = url.split('/uploads/');
      return urlParts[1] || '';
    }
  }
} 