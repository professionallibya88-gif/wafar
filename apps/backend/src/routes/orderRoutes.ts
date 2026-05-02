import { Router } from 'express';
import { getMyOrders, getSupplierOrders, updateOrderStatus } from '../controllers/orderController';
import { auth } from '../middleware/auth';
import { requireFeature } from '../middleware/featureFlag';

const router = Router();

router.use(auth, requireFeature('cart'));

router.get('/', getMyOrders);
router.get('/supplier', getSupplierOrders);
router.put('/:id/status', updateOrderStatus);

export default router;
