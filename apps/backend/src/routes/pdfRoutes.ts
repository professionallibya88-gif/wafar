import { Router } from 'express';
import {
  upload,
  listFiles,
  getFile,
  getFileParts,
  deleteFile,
  reprocess,
  jobStatus,
  testMethod,
  healthCheck,
  methodStats,
  stats,
  catalogs,
  versions,
  extractMetadata,
} from '../controllers/pdfController';
import { auth } from '../middleware/auth';
import { uploadLimiter, dailyUploadLimiter } from '../middleware/rateLimiter';
import { upload as uploadMiddleware } from '../middleware/upload';
import { requireFeature } from '../middleware/featureFlag';
import { pdf as pdfRules } from '../validators';
import { runValidators } from '../utils/validate';

const router = Router();

router.post(
  '/upload',
  auth,
  requireFeature('upload'),
  uploadLimiter,
  dailyUploadLimiter,
  uploadMiddleware.array('files[]', 20),
  runValidators(pdfRules.uploadPdfRules),
  upload
);

router.post(
  '/extract-metadata',
  auth,
  requireFeature('upload'),
  uploadLimiter,
  uploadMiddleware.single('file'),
  runValidators(pdfRules.extractMetadataRules),
  extractMetadata
);

router.get('/files', auth, requireFeature('files'), listFiles);
router.get(
  '/files/:id',
  auth,
  requireFeature('files'),
  runValidators(pdfRules.fileIdRules),
  getFile
);
router.get(
  '/files/:id/parts',
  auth,
  requireFeature('files'),
  runValidators(pdfRules.fileIdRules),
  getFileParts
);
router.delete(
  '/files/:id',
  auth,
  requireFeature('files'),
  runValidators(pdfRules.fileIdRules),
  deleteFile
);
router.post(
  '/files/:id/reprocess',
  auth,
  requireFeature('upload'),
  runValidators(pdfRules.reprocessPdfRules),
  reprocess
);
router.get(
  '/files/:id/job-status',
  auth,
  requireFeature('upload'),
  runValidators(pdfRules.fileIdRules),
  jobStatus
);
router.post(
  '/test-method',
  auth,
  requireFeature('upload'),
  uploadMiddleware.single('file'),
  runValidators(pdfRules.testPdfMethodRules),
  testMethod
);
router.get('/health-check', auth, requireFeature('upload'), healthCheck);
router.get('/method-stats', auth, requireFeature('upload'), methodStats);
router.get('/stats', auth, requireFeature('files'), stats);
router.get('/catalogs', auth, requireFeature('catalogs'), catalogs);
router.get(
  '/versions/:supplierId',
  auth,
  requireFeature('catalogs'),
  runValidators(pdfRules.supplierVersionsRules),
  versions
);

export default router;
