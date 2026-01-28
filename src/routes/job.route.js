import { Router } from 'express';
import { 
    createJob, 
    getAllJobs, 
    updateJob, 
    deleteJob,
    cleanupExpiredJobs 
} from '../controllers/job.controller.js';
import { verifyJWT, verifyRole } from '../middlewares/auth.middleware.js';

const router = Router();

router.route("/").get(verifyJWT, getAllJobs);
router.use(verifyJWT); 

router.route("/create").post(verifyRole("admin"), createJob);
router.route("/:id").patch(verifyRole("admin"), updateJob);
router.route("/:id").delete(verifyRole("admin"), deleteJob);

// Cleanup Route (Hit this button once a month or use a Cron Job)
router.route("/cleanup/expired").delete(verifyRole("admin"), cleanupExpiredJobs);

export default router;