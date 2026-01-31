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
    const { role, customKeywords } = req.body; // Supports custom keywords now
    if (!role) {
        throw new ApiError(400, "Job Role (slug) is required");
    }

    const user = req.user; // Fetched from verifyJWT middleware

    // 2. SMART CREDIT CHECK (The Fix)
    // Find or create credits document for user
    let userCredits = await Credits.findOne({ userId: user._id });
    
    // LOGIC: Determine Plan Limits based on User's current subscription
    const isPremium = user.subscription === 'premium';
    const limit = isPremium ? 50 : 3; // Premium gets 50, Free gets 3

    if (!userCredits) {
        // CASE A: First time user (Initialize based on User Plan)
        userCredits = await Credits.create({ 
            userId: user._id, 
            plan: user.subscription, // <--- SYNC WITH USER MODEL
            resumeAnalysisCredits: limit,
            resetAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // +7 days
        });
    } else {
        // CASE B: Existing user, check if plan mismatch (e.g. they just upgraded manually)
        if (userCredits.plan !== user.subscription) {
            userCredits.plan = user.subscription;
            // If upgrading to premium, boost credits immediately
            if (user.subscription === 'premium') {
                userCredits.resumeAnalysisCredits += (50 - 3); // Add the difference
            }
            await userCredits.save();
        }
    }

    // 3. Stop if no credits
    if (userCredits.resumeAnalysisCredits <= 0) {
        throw new ApiError(403, `You have used all your ${userCredits.plan} credits for this week.`);
    }

    // 4. Process Resume
    // Parse custom keywords if sent as string (Multipart form sends arrays as strings sometimes)
    let parsedKeywords = [];
    if (customKeywords) {
        try {
            parsedKeywords = typeof customKeywords === 'string' ? JSON.parse(customKeywords) : customKeywords;
        } catch (e) {
            parsedKeywords = []; 
        }
    }

    // Premium Check: Only allow custom keywords if Premium
    if (parsedKeywords.length > 0 && user.subscription !== 'premium') {
        // We don't throw error, we just ignore them to be nice, or warn user
        parsedKeywords = []; 
    }

    const analysisResult = await analyzeResume(req.file.buffer, role, parsedKeywords);

    // 5. Update Credits & User
    userCredits.resumeAnalysisCredits -= 1;
    await userCredits.save();

    // Update latest score on User
    await User.findByIdAndUpdate(user._id, { atsScore: analysisResult.score });

    return res.status(200).json(
        new ApiResponse(200, {
            ...analysisResult,
            creditsLeft: userCredits.resumeAnalysisCredits,
            plan: userCredits.plan
        }, "Resume analyzed successfully")
    );
});

export { analyzeResumeController };