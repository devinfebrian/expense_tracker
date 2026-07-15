import { Router } from 'express';
import * as aiController from '../controllers/aiController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.post('/insights', auth, aiController.getInsights);
router.post('/parse-expense', auth, aiController.parseExpense);

export default router;
