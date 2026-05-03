import { Router } from 'express';
import { getMyOrders, getSupplierOrders, updateOrderStatus } from '../controllers/orderController';
import { auth } from '../middleware/auth';
import { requireFeature } from '../middleware/featureFlag';
import { runValidators } from '../utils/validate';
import { updateOrderStatusRules } from '../validators/cartValidator';

const router = Router();

router.use(auth, requireFeature('cart'));

router.get('/', getMyOrders);
router.get('/supplier', getSupplierOrders);
router.put('/:id/status', runValidators(updateOrderStatusRules), updateOrderStatus);

export default router;
