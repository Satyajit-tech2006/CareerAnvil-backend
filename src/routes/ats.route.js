import { Router } from 'express';
import multer from 'multer';
import { analyzeResumeController, getCreditsController} from '../controllers/ats.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { extractKeywordsController } from '../controllers/jd.controller.js';

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

router.route("/extract-keywords").post(verifyJWT, extractKeywordsController);
router.route("/credits").get(verifyJWT, getCreditsController);
export default router;