import { extractKeywords } from '../services/jd.service.js';
import { Credits } from '../models/credits.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const extractKeywordsController = asyncHandler(async (req, res) => {
    const { description } = req.body;

    if (!description || description.trim().length < 10) {
        throw new ApiError(400, "Please provide a valid Job Description.");
    }

    const user = req.user;

    // 1. Credit Check (Using the new jdKeywordsCredits field)
    let userCredits = await Credits.findOne({ userId: user._id });
    
    // Initialize if missing (Self-healing DB logic)
    if (!userCredits) {
         // Should have been created at signup/login, but just in case
         const limit = user.subscription === 'premium' ? 50 : 3;
         userCredits = await Credits.create({ 
             userId: user._id, 
             plan: user.subscription,
             resumeAnalysisCredits: limit,
             jdKeywordsCredits: limit, // Initialize new field
             resetAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
         });
    }

    // Check Balance
    if (userCredits.jdKeywordsCredits <= 0) {
        throw new ApiError(403, `You have used all your Job Description credits for this week.`);
    }

    // 2. Execute Logic
    const csvResult = extractKeywords(description);

    // 3. Deduct Credit
    userCredits.jdKeywordsCredits -= 1;
    await userCredits.save();

    return res.status(200).json(
        new ApiResponse(200, {
            csv: csvResult,
            creditsLeft: userCredits.jdKeywordsCredits
        }, "Keywords extracted successfully")
    );
});

export { extractKeywordsController };