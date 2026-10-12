import express from 'express';
import {
  listLocalInfo,
  getCategories,
  getLocalInfo,
  createLocalInfo,
} from '../controllers/localInfo.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

// Provided by Victory's auth module. Expected behavior:
//   protect             -> verifies the Bearer JWT and sets req.user ({ _id, role, ... })
//   restrictTo(...roles) -> 403 unless req.user.role is one of the roles

const router = express.Router();

router.get('/', protect, listLocalInfo);

// Must come before '/:id', otherwise "categories" is treated as an id
router.get('/categories', protect, getCategories);

router.get('/:id', protect, getLocalInfo);

router.post('/', protect, restrictTo('admin'), createLocalInfo);

export default router;
