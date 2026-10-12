import express from 'express';
import { getMe, updateMe } from '../controllers/auth.controller.js';
import { getAccountVerification, submitAccountVerification } from '../controllers/verification.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);
router.get('/me/verification', protect, restrictTo('landlord', 'agent'), getAccountVerification);
router.post('/me/verification', protect, restrictTo('landlord', 'agent'), submitAccountVerification);

export default router;
