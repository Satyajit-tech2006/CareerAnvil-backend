import { Router } from 'express';
import { toggleItemStatus, getSheetProgress } from '../controllers/progress.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJWT); // Must be logged in to track progress

// Post: Mark item as done/todo
router.route("/toggle").post(toggleItemStatus);

// Get: Load checkboxes for a specific sheet
router.route("/:sheetId").get(getSheetProgress);

export default router;