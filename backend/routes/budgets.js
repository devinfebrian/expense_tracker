import { Router } from 'express';
import * as budgetController from '../controllers/budgetController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/', auth, budgetController.getBudgets);
router.post('/', auth, budgetController.createBudget);
router.put('/:id', auth, budgetController.updateBudget);
router.delete('/:id', auth, budgetController.deleteBudget);

export default router;
