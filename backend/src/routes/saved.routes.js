import { Router } from 'express';
import { saveItem, getSavedItems, deleteSavedItem } from '../controllers/saved.controller.js';
import { protect } from '../middlewares/auth.middleware.js';


const router = Router();

router.post('/', protect, saveItem);
router.get('/', protect, getSavedItems);
router.delete('/:id', protect, deleteSavedItem);

export default router;