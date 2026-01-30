import { Router } from 'express';
import { enrollUser, getEnrolledSheets } from '../controllers/enrollment.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJWT);

router.route("/").post(enrollUser);       // Start a sheet
router.route("/my-sheets").get(getEnrolledSheets); // Get dashboard list

export default router;