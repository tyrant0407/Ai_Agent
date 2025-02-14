import {Router} from 'express';
import * as geminiController from '../controllers/gemini.controller.js';
const router = Router();


router.get('/get-result',geminiController.getResult);

export default router;