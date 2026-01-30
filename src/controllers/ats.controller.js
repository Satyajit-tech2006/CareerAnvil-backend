import { analyzeResume } from '../services/ats.service.js';
import { User } from '../models/user.model.js';
import { Credits } from '../models/credits.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const analyzeResumeController = asyncHandler(async (req, res) => {
    // 1. Validate Input
    if (!req.file) {
        throw new ApiError(400, "Resume PDF file is required");
    }
    const { role } = req.body;
    if (!role) {
        throw new ApiError(400, "Job Role (slug) is required");
    }

    const userId = req.user._id;

    // 2. Check Credits
    // Find or create credits document for user
    let userCredits = await Credits.findOne({ userId });
    
    if (!userCredits) {
        // Initialize if not exists (fallback)
        userCredits = await Credits.create({ 
            userId, 
            plan: 'freemium', 
            resumeAnalysisCredits: 3,
            resetAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // +7 days
        });
    }

    if (userCredits.resumeAnalysisCredits <= 0) {
        throw new ApiError(403, "You have used all your resume analysis credits for this week.");
    }

    // 3. Process Resume (The heavy lifting)
    const analysisResult = await analyzeResume(req.file.buffer, role);

    // 4. Update User & Credits
    // Decrement credit
    userCredits.resumeAnalysisCredits -= 1;
    await userCredits.save();

    // Store latest score in User model
    await User.findByIdAndUpdate(userId, { atsScore: analysisResult.score });

    // 5. Respond
    return res.status(200).json(
        new ApiResponse(200, {
            ...analysisResult,
            creditsLeft: userCredits.resumeAnalysisCredits
        }, "Resume analyzed successfully")
    );
});

export { analyzeResumeController };