import express from 'express';
import { getAdminReports, moderateReport } from '../controllers/report.controller.js';
import { listAdminAccommodations, verifyAccommodation } from '../controllers/accommodation.controller.js';
import { listAccountVerifications, reviewAccountVerification } from '../controllers/verification.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

//Guard all admin routes with protect and restrictTo('admin')
router.use(protect, restrictTo('admin'));

//Admin reports
router.get('/reports', getAdminReports);
router.patch('/reports/:id', moderateReport);

// Listing verification queue
router.get('/accommodations', listAdminAccommodations);
router.patch('/accommodations/:id/verification', verifyAccommodation);

// Landlord and agent account verification
router.get('/account-verifications', listAccountVerifications);
router.patch('/account-verifications/:userId', reviewAccountVerification);

export default router;
