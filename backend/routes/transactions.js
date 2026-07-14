import { Router } from 'express';
import * as transactionController from '../controllers/transactionController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/', auth, transactionController.getTransactions);
router.post('/', auth, transactionController.createTransaction);
router.put('/:id', auth, transactionController.updateTransaction);
router.delete('/:id', auth, transactionController.deleteTransaction);

export default router;
