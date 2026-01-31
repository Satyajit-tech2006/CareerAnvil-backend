import { extractKeywords } from '../services/jd.service.js';
import { Credits } from '../models/credits.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// Reusing Constants for consistency
const WEEKLY_FREE_LIMIT = 3;
const WEEKLY_PREMIUM_LIMIT = 30;

const extractKeywordsController = asyncHandler(async (req, res) => {
    const { description } = req.body;

    if (!description || description.trim().length < 10) {
        throw new ApiError(400, "Please provide a valid Job Description.");
    }

    const user = req.user;

    // --- DUPLICATED CREDIT LOGIC (Consider moving 'ensureCredits' to utils/creditHelper.js to avoid this duplication) ---
    let creds = await Credits.findOne({ userId: user._id });
    const currentPlan = ['premium', 'premium_pro'].includes(user.subscription) 
        ? user.subscription.replace(' ', '_') 
        : 'freemium';
    const limit = (currentPlan !== 'freemium') ? WEEKLY_PREMIUM_LIMIT : WEEKLY_FREE_LIMIT;

    if (!creds) {
        creds = await Credits.create({
            userId: user._id,
            plan: currentPlan,
            resumeAnalysisCredits: limit,
            jdKeywordsCredits: limit,
            resetAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
    }

    // Reset Check
    if (new Date() > creds.resetAt) {
        creds.resumeAnalysisCredits = limit;
        creds.jdKeywordsCredits = limit;
        creds.resetAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await creds.save();
    }

    // Sync Plan Check
    if (creds.plan !== currentPlan) {
        if (currentPlan !== 'freemium' && creds.plan === 'freemium') {
            creds.jdKeywordsCredits = Math.max(creds.jdKeywordsCredits, limit);
        }
        creds.plan = currentPlan;
        await creds.save();
    }
    // --------------------------------------------------------------------------------

    // 1. Check Balance
    if (creds.jdKeywordsCredits <= 0) {
        throw new ApiError(403, `You have used all your Job Description credits for this week.`);
    }

    // 2. Execute Logic
    const csvResult = extractKeywords(description);

    // 3. Deduct Credit
    creds.jdKeywordsCredits -= 1;
    await creds.save();

    return res.status(200).json(
        new ApiResponse(200, {
            csv: csvResult,
            creditsLeft: creds.jdKeywordsCredits
        }, "Keywords extracted successfully")
    );
});

export { extractKeywordsController };