import { Router } from 'express';
import { getCart, addItem, updateItem, removeItem, checkout } from '../controllers/cartController';
import { auth } from '../middleware/auth';
import { requireFeature } from '../middleware/featureFlag';

const router = Router();

router.use(auth, requireFeature('cart'));

router.get('/', getCart);
router.post('/items', addItem);
router.put('/items/:id', updateItem);
router.delete('/items/:id', removeItem);
router.post('/checkout', checkout);

export default router;
