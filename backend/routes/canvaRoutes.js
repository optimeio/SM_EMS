import express from 'express';
import {
  getCanvaStatus,
  getCanvaAuthUrl,
  canvaCallback,
  autofillCanvaTemplate
} from '../controllers/canvaController.js';

const router = express.Router();

router.get('/status', getCanvaStatus);
router.get('/auth-url', getCanvaAuthUrl);
router.get('/callback', canvaCallback);
router.post('/autofill', autofillCanvaTemplate);

export default router;
