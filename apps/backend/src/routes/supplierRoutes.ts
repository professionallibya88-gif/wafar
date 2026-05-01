import { Router } from 'express';
import { auth } from '../middleware/auth';
import * as supplierController from '../controllers/supplierController';

const router = Router();

router.get('/', auth, supplierController.list);
router.post('/', auth, supplierController.create);
router.get('/:id', auth, supplierController.getById);

export default router;
