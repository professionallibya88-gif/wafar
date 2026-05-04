import { put, del } from '@vercel/blob';
import { promises as fs } from 'fs';
import path from 'path';
import logger from '../config/logger';

export class VercelBlobService {
  /**
   * Upload a local file to Vercel Blob and return the URL
   */
  async uploadFile(filePath: string, originalName: string): Promise<string> {
    if (process.env.USE_VERCEL_BLOB !== 'true') {
      return filePath;
    }

    try {
      const fileBuffer = await fs.readFile(filePath);
      const ext = path.extname(originalName);
      const baseName = path.basename(originalName, ext);
      const uniqueName = `${baseName}-${Date.now()}${ext}`;

      const { url } = await put(`pdfs/${uniqueName}`, fileBuffer, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      logger.info(`تم رفع الملف إلى Vercel Blob بنجاح: ${url}`);
      return url;
    } catch (error) {
      logger.error('خطأ في رفع الملف إلى Vercel Blob:', error);
      throw error;
    }
  }

  /**
   * Delete a file from Vercel Blob
   */
  async deleteFile(fileUrl: string): Promise<void> {
    if (
      process.env.USE_VERCEL_BLOB !== 'true' ||
      !fileUrl.includes('public.blob.vercel-storage.com')
    ) {
      // If it's a local file, delete locally
      try {
        await fs.unlink(fileUrl);
      } catch (err) {
        // ignore
      }
      return;
    }

    try {
      await del(fileUrl, {
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      logger.info(`تم حذف الملف من Vercel Blob بنجاح: ${fileUrl}`);
    } catch (error) {
      logger.error('خطأ في حذف الملف من Vercel Blob:', error);
      throw error;
    }
  }
}

export const vercelBlobService = new VercelBlobService();
