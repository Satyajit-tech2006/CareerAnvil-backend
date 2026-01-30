import { Router } from 'express';
import { saveNote, getNote } from '../controllers/note.controller.js';
import { verifyJWT, verifyRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Public: Read a note
router.route("/:itemId").get(getNote);

// Admin: Create/Edit
router.use(verifyJWT);
router.route("/").post(verifyRole("admin"), saveNote);

export default router;