import { Router } from 'express';
import { 
    createSection, 
    getSectionsBySheet, 
    updateSection, 
    deleteSection 
} from '../controllers/section.controller.js';
import { verifyJWT, verifyRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Public: Get all sections for a specific sheet
router.route("/sheet/:sheetId").get(getSectionsBySheet);

// Admin Routes
router.use(verifyJWT);

router.route("/").post(verifyRole("admin"), createSection);
router.route("/:id").patch(verifyRole("admin"), updateSection);
router.route("/:id").delete(verifyRole("admin"), deleteSection);

export default router;