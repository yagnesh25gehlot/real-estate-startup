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
  });
  
  s3 = new AWS.S3();
  BUCKET_NAME = process.env.AWS_S3_BUCKET;
}

export interface UploadResult {
  url: string;
  key: string;
}

export class S3Uploader {
  static async uploadFile(
    file: Express.Multer.File,
    folder: string = 'properties'
  ): Promise<UploadResult> {
    try {
      if (!s3 || !BUCKET_NAME) {
        console.log('⚠️ S3 not configured, storing file locally');
        return await this.uploadFileLocally(file, folder);
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
    } catch (error) {
      console.error('S3 upload error:', error);
      throw createError('Failed to upload file to S3', 500);
    }
  }

  static async uploadFileLocally(
    file: Express.Multer.File,
    folder: string = 'properties'
  ): Promise<UploadResult> {
    try {
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'uploads', folder);
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Sanitize filename to avoid spaces and special characters
      const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/_+/g, '_');
      const fileName = `${Date.now()}-${sanitizedName}`;
      const filePath = path.join(uploadsDir, fileName);
      const relativePath = path.join(folder, fileName);

      // Write file to disk
      fs.writeFileSync(filePath, file.buffer);

      // Auto-resize image if it's an image file
      if (file.mimetype.startsWith('image/')) {
        try {
          const { execSync } = require('child_process');
          const smallFileName = fileName.replace(/\.[^/.]+$/, '-small$&');
          const smallFilePath = path.join(uploadsDir, smallFileName);
          
          // Use sips to resize image to max 800px width/height
          execSync(`sips -Z 800 "${filePath}" --out "${smallFilePath}"`, { stdio: 'ignore' });
          
          // Use the smaller image URL
          const smallRelativePath = path.join(folder, smallFileName);
          const url = `/uploads/${smallRelativePath}`;
          
          return {
            url,
            key: smallRelativePath,
          };
        } catch (resizeError) {
          console.log('⚠️ Image resize failed, using original:', resizeError.message);
        }
      }

      // Return local URL (original if resize failed)
      const url = `/uploads/${relativePath}`;
      
      return {
        url,
        key: relativePath,
      };
    } catch (error) {
      console.error('Local upload error:', error);
      throw createError('Failed to upload file locally', 500);
    }
  }

  static async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder: string = 'properties'
  ): Promise<UploadResult[]> {
    try {
      const uploadPromises = files.map(file => this.uploadFile(file, folder));
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Multiple S3 upload error:', error);
      throw createError('Failed to upload files to S3', 500);
    }
  }

  static async deleteFile(key: string): Promise<void> {
    try {
      if (!s3 || !BUCKET_NAME) {
        console.log('⚠️ S3 not configured, deleting local file');
        return await this.deleteFileLocally(key);
      }

      const params = {
        Bucket: BUCKET_NAME,
        Key: key,
      };

      await s3.deleteObject(params).promise();
      console.log(`✅ File deleted from S3: ${key}`);
    } catch (error) {
      console.error('S3 delete error:', error);
      throw createError('Failed to delete file from S3', 500);
    }
  }

  static async deleteFileLocally(key: string): Promise<void> {
    try {
      const filePath = path.join(process.cwd(), 'uploads', key);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✅ Local file deleted: ${key}`);
      }
    } catch (error) {
      console.error('Local delete error:', error);
      throw createError('Failed to delete local file', 500);
    }
  }

  static async deleteMultipleFiles(keys: string[]): Promise<void> {
    try {
      const deletePromises = keys.map(key => this.deleteFile(key));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Multiple S3 delete error:', error);
      throw createError('Failed to delete files from S3', 500);
    }
  }

  static getFileUrl(key: string): string {
    if (!BUCKET_NAME || !process.env.AWS_REGION) {
      return `/uploads/${key}`;
    }
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }

  static extractKeyFromUrl(url: string): string {
    if (!BUCKET_NAME || !process.env.AWS_REGION) {
      // Extract from local URL
      const localPattern = /\/uploads\/(.+)/;
      const localMatch = url.match(localPattern);
      return localMatch ? localMatch[1] : '';
    }
    
    const bucketName = BUCKET_NAME;
    const region = process.env.AWS_REGION;
    const pattern = new RegExp(`https://${bucketName}\\.s3\\.${region}\\.amazonaws\\.com/(.+)`);
    const match = url.match(pattern);
    return match ? match[1] : '';
  }
} 