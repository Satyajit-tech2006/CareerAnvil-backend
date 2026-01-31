import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { 
    initiatePayment, 
    submitUTR, 
    getActivePayment 
} from '../controllers/payment.controller.js';

const router = Router();
router.use(verifyJWT);

router.post("/initiate", initiatePayment);
router.post("/submit-utr", submitUTR);
router.get("/active", getActivePayment);

export default router;