import { Router } from 'express';
import { 
    createSheet, 
    getAllSheets, 
    getSheetBySlug, 
    updateSheet, 
    deleteSheet 
} from '../controllers/sheet.controller.js';
import { verifyJWT, verifyRole } from '../middlewares/auth.middleware.js';

const router = Router();

router.route("/").get(getAllSheets);
router.route("/:slug").get(getSheetBySlug);

router.use(verifyJWT); 

router.route("/").post(verifyRole("admin"), createSheet);
router.route("/:id").patch(verifyRole("admin"), updateSheet);
router.route("/:id").delete(verifyRole("admin"), deleteSheet);

export default router;