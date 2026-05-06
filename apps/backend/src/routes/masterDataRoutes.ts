import { Router } from 'express';
import { getMasterData } from '../controllers/masterDataController';

const router = Router();

// مسار عام للقوائم المرجعية المستخدمة في الواجهات
router.get('/', getMasterData);

export default router;
