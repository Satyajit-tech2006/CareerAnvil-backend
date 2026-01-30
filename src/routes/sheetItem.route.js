import { Router } from 'express';
import { 
    createItem, 
    getItemsBySection, 
    updateItem, 
    deleteItem 
} from '../controllers/sheetItem.controller.js';
import { verifyJWT, verifyRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Public: Get items inside a specific section
router.route("/section/:sectionId").get(getItemsBySection);

// Admin Routes
router.use(verifyJWT);

router.route("/").post(verifyRole("admin"), createItem);
router.route("/:id").patch(verifyRole("admin"), updateItem);
router.route("/:id").delete(verifyRole("admin"), deleteItem);

export default router;