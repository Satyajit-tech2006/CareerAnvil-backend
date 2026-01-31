import { analyzeResume } from '../services/ats.service.js';
import { User } from '../models/user.model.js';
import { Credits } from '../models/credits.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// CONSTANTS
const WEEKLY_FREE_LIMIT = 3;
const WEEKLY_PREMIUM_LIMIT = 30;

// --- HELPER: Handle Weekly Resets & Plan Sync ---
const ensureCredits = async (userId, userSubscription) => {
    let creds = await Credits.findOne({ userId });
    
    // Normalize Plan String
    const currentPlan = ['premium', 'premium_pro'].includes(userSubscription) 
        ? userSubscription.replace(' ', '_') // ensure premium_pro
        : 'freemium';

    const limit = (currentPlan === 'premium' || currentPlan === 'premium_pro') 
        ? WEEKLY_PREMIUM_LIMIT 
        : WEEKLY_FREE_LIMIT;

    // 1. Create if missing
    if (!creds) {
        creds = await Credits.create({
            userId,
            plan: currentPlan,
            resumeAnalysisCredits: limit,
            jdKeywordsCredits: limit,
            resetAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
    }

    // 2. Check for Weekly Reset
    if (new Date() > creds.resetAt) {
        creds.resumeAnalysisCredits = limit;
        creds.jdKeywordsCredits = limit;
        creds.resetAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await creds.save();
    }

    // 3. Check for Plan Upgrade/Downgrade Mismatch
    if (creds.plan !== currentPlan) {
        // If upgrading, boost credits immediately
        if (currentPlan !== 'freemium' && creds.plan === 'freemium') {
            creds.resumeAnalysisCredits = Math.max(creds.resumeAnalysisCredits, limit);
            creds.jdKeywordsCredits = Math.max(creds.jdKeywordsCredits, limit);
        }
        creds.plan = currentPlan;
        await creds.save();
    }

    return creds;
};


const analyzeResumeController = asyncHandler(async (req, res) => {
    // 1. Validate Input
    if (!req.file) throw new ApiError(400, "Resume PDF file is required");
    
    const { role, customKeywords } = req.body;
    if (!role) throw new ApiError(400, "Job Role (slug) is required");

    const user = req.user;
    
    // 2. Get & Verify Credits (Handles Reset & Upgrades automatically)
    const userCredits = await ensureCredits(user._id, user.subscription);

    // 3. Stop if no credits
    if (userCredits.resumeAnalysisCredits <= 0) {
        throw new ApiError(403, `You have used all your ${userCredits.plan} resume credits for this week.`);
    }

    // 4. Parse Keywords
    let parsedKeywords = [];
    if (customKeywords) {
        try {
            parsedKeywords = typeof customKeywords === 'string' ? JSON.parse(customKeywords) : customKeywords;
        } catch (e) {
            parsedKeywords = []; 
        }
    }

    // Premium Check for Custom Keywords
    const isPremium = userCredits.plan !== 'freemium';
    if (parsedKeywords.length > 0 && !isPremium) {
        parsedKeywords = []; // Ignore custom keywords for free users
    }

    // 5. Execute Service
    const analysisResult = await analyzeResume(req.file.buffer, role, parsedKeywords, isPremium);

    // 6. Deduct Credit
    userCredits.resumeAnalysisCredits -= 1;
    await userCredits.save();

    // Update User Profile Score
    await User.findByIdAndUpdate(user._id, { atsScore: analysisResult.score });

    return res.status(200).json(
        new ApiResponse(200, {
            ...analysisResult,
            creditsLeft: userCredits.resumeAnalysisCredits,
            plan: userCredits.plan
        }, "Resume analyzed successfully")
    );
});


const getCreditsController = asyncHandler(async (req, res) => {
    const user = req.user;
    
    // Ensure credits are reset if needed before showing them
    const userCredits = await ensureCredits(user._id, user.subscription);

    return res.status(200).json(
        new ApiResponse(200, {
            resumeCredits: userCredits.resumeAnalysisCredits,
            jdCredits: userCredits.jdKeywordsCredits,
            plan: userCredits.plan,
            resetAt: userCredits.resetAt
        }, "Credits fetched successfully")
    );
});

export { analyzeResumeController, getCreditsController };