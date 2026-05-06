import { Router } from 'express';
import { auth } from '../middleware/auth';
import * as supplierController from '../controllers/supplierController';
import { runValidators } from '../utils/validate';
import { supplier as supplierRules } from '../validators';

const router = Router();

router.get('/', auth, runValidators(supplierRules.listSuppliersRules), supplierController.list);
router.post('/', auth, runValidators(supplierRules.createSupplierRules), supplierController.create);
router.get('/:id', auth, runValidators(supplierRules.supplierIdRules), supplierController.getById);

export default router;
