import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import auth from '../middleware/auth.js';
import { registerLimiter, loginLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/register', registerLimiter, authController.register);
router.post('/login', loginLimiter, authController.login);
router.post('/logout', authController.logout);
router.get('/me', auth, authController.getMe);

export default router;