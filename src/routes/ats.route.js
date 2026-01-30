import { Router } from 'express';
import multer from 'multer';
import { analyzeResumeController } from '../controllers/ats.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Configure Multer (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});

// Route: POST /api/v1/ats/analyze
router.route('/analyze').post(
    verifyJWT, 
    upload.single('resume'), 
    analyzeResumeController
);

export default router;