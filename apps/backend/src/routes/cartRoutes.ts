import { Router } from 'express';
import { getCart, addItem, updateItem, removeItem, checkout } from '../controllers/cartController';
import { auth } from '../middleware/auth';
import { requireFeature } from '../middleware/featureFlag';
import { runValidators } from '../utils/validate';
import {
  addCartItemRules,
  cartItemIdRules,
  updateCartItemRules,
} from '../validators/cartValidator';

const router = Router();

router.use(auth, requireFeature('cart'));

router.get('/', getCart);
router.post('/items', runValidators(addCartItemRules), addItem);
router.put('/items/:id', runValidators(updateCartItemRules), updateItem);
router.delete('/items/:id', runValidators(cartItemIdRules), removeItem);
router.post('/checkout', checkout);

export default router;
