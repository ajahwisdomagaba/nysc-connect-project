import { Router } from 'express';
import express from 'express';
import { getStates, getLgasByState } from '../controllers/location.controller.js';

const router = express.Router();

router.get('/states', getStates);
router.get('/lgas', getLgasByState);

export default router;