import { Request } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import logger from '../config/logger';
import { v4 as uuidv4 } from 'uuid';
import { ValidationError } from '../errors';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

type MulterCallback = (_error: Error | null, _result: string) => void;
type FileFilterCb = (_error: Error | null, _acceptFile: boolean) => void;

// إنشاء مجلد uploads إذا لم يكن موجوداً
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// إعداد التخزين
const storage = multer.diskStorage({
  destination: (_req: Request, _file: MulterFile, cb: MulterCallback) => {
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: MulterFile, cb: MulterCallback) => {
    const uniqueName = `${uuidv4()}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// فلتر الملفات
const fileFilter = (_req: Request, file: MulterFile, cb: FileFilterCb) => {
  const allowedMimes = ['application/pdf'];
  if (!allowedMimes.includes(file.mimetype)) {
    return cb(new ValidationError('يُسمح فقط بملفات PDF'), false);
  }

  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.pdf') {
    return cb(new ValidationError('يُسمح فقط بملفات PDF'), false);
  }

  cb(null, true);
};

// إعداد Multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: process.env.MAX_FILE_SIZE
      ? parseInt(process.env.MAX_FILE_SIZE, 10)
      : 100 * 1024 * 1024, // 100MB افتراضياً
  },
});

/**
 * فحص magic bytes للملف للتأكد من أنه PDF حقيقي
 * @param {String} filePath - مسار الملف
 * @returns {Boolean} - true إذا كان PDF صحيح
 */
async function validatePDFMagicBytes(filePath: string): Promise<boolean> {
  let fileHandle;
  try {
    const buffer = Buffer.alloc(4);
    fileHandle = await fs.promises.open(filePath, 'r');
    await fileHandle.read(buffer, 0, 4, 0);

    // PDF magic bytes: %PDF
    return buffer.toString('ascii', 0, 4) === '%PDF';
  } catch (error) {
    logger.error('خطأ في فحص magic bytes:', error);
    return false;
  } finally {
    await fileHandle?.close();
  }
}

const imageFileFilter = (_req: Request, file: MulterFile, cb: FileFilterCb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/x-icon',
    'image/vnd.microsoft.icon',
  ];
  const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.ico'];
  if (!allowedMimes.includes(file.mimetype)) {
    return cb(new ValidationError('يُسمح فقط بملفات الصور'), false);
  }
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExts.includes(ext)) {
    return cb(new ValidationError('امتداد الصورة غير مسموح'), false);
  }
  cb(null, true);
};

// إعداد Multer للصور
const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export { upload, uploadImage, validatePDFMagicBytes };
