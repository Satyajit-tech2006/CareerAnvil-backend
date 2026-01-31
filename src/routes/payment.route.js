import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { 
    initiatePayment, 
    submitUTR, 
    getActivePayment,
    adminVerifyPayment,
    getAllPayments,
    cleanupPendingPayments
} from '../controllers/payment.controller.js';

const router = Router();

// Apply JWT verification to all routes
router.use(verifyJWT);

// --- User Routes ---
router.post("/initiate", initiatePayment);       // Step 1: Create Intent
router.post("/submit-utr", submitUTR);           // Step 2: Submit UTR
router.get("/active", getActivePayment);         // Check Status

// --- Admin Routes ---
// Note: The controller itself also checks req.user.role !== 'admin' for double security
router.post("/admin/verify", adminVerifyPayment);
router.get("/admin/all", getAllPayments); 
router.post("/admin/cleanup", cleanupPendingPayments); // Cleanup stale payments

export default router;