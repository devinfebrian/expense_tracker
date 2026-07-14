import { Router } from 'express';
import * as categoryController from '../controllers/categoryController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/', auth, categoryController.getCategories);

export default router;
