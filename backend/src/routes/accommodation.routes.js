import express from 'express';
import {
  getAccommodationFeed,
  getMyAccommodations,
  createAccommodation,
  getAccommodation,
  updateAccommodation,
  deleteAccommodation,
} from '../controllers/accommodation.controller.js';

// Provided by Victory's auth module. Expected behavior:
//   protect            -> verifies the Bearer JWT and sets req.user ({ _id, role, ... })
//   restrictTo(...roles) -> 403 unless req.user.role is one of the roles
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getAccommodationFeed);
router.get('/mine', protect, restrictTo('landlord', 'agent', 'admin'), getMyAccommodations);
router.post('/', protect, restrictTo('admin', 'landlord', 'agent'), createAccommodation);

router
  .route('/:id')
  .get(protect, getAccommodation)
  .put(protect, restrictTo('admin', 'landlord', 'agent'), updateAccommodation)
  .delete(protect, restrictTo('admin', 'landlord', 'agent'), deleteAccommodation);

export default router;

// In app.js:
//   import accommodationRoutes from './routes/accommodation.routes.js';
//   app.use('/api/v1/accommodations', accommodationRoutes);
