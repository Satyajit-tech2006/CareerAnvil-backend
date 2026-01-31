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
    
    const { role, customKeywords } = req.body;
    if (!role) {
        throw new ApiError(400, "Job Role (slug) is required");
    }

    const user = req.user; // Fetched from verifyJWT middleware
    
    // Check Premium Status (Includes 'premium' and 'premium pro')
    const isPremiumUser = user.subscription === 'premium' || user.subscription === 'premium pro';

    // 2. SMART CREDIT CHECK
    // Find or create credits document for user
    let userCredits = await Credits.findOne({ userId: user._id });
    
    // Premium gets 50, Free gets 3
    const limit = isPremiumUser ? 50 : 3; 

    if (!userCredits) {
        // CASE A: First time user
        userCredits = await Credits.create({ 
            userId: user._id, 
            plan: user.subscription,
            resumeAnalysisCredits: limit,
            resetAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // +7 days
        });
    } else {
        // CASE B: Existing user, check for plan mismatch (e.g. manual upgrade)
        if (userCredits.plan !== user.subscription) {
            const oldPlan = userCredits.plan;
            userCredits.plan = user.subscription;
            
            // If upgrading from freemium to premium, add the difference
            if (isPremiumUser && oldPlan === 'freemium') {
                userCredits.resumeAnalysisCredits += (50 - 3);
            }
            await userCredits.save();
        }
    }

    // 3. Stop if no credits
    if (userCredits.resumeAnalysisCredits <= 0) {
        throw new ApiError(403, `You have used all your ${userCredits.plan} credits for this week.`);
    }

    // 4. Process Resume & Keywords
    // Parse custom keywords if sent as string (Multipart form sends arrays as strings)
    let parsedKeywords = [];
    if (customKeywords) {
        try {
            parsedKeywords = typeof customKeywords === 'string' ? JSON.parse(customKeywords) : customKeywords;
        } catch (e) {
            console.error("Keyword Parse Error:", e);
            parsedKeywords = []; 
        }
    }

    // Premium Check: Only allow custom keywords if Premium
    if (parsedKeywords.length > 0 && !isPremiumUser) {
        parsedKeywords = []; 
    }

    // EXECUTE SERVICE
    // Pass 'isPremiumUser' as the 4th argument to trigger Company ATS Scoring
    const analysisResult = await analyzeResume(req.file.buffer, role, parsedKeywords, isPremiumUser);

    // 5. Update Credits & User
    userCredits.resumeAnalysisCredits -= 1;
    await userCredits.save();

    // Update latest score on User profile
    await User.findByIdAndUpdate(user._id, { atsScore: analysisResult.score });

    return res.status(200).json(
        new ApiResponse(200, {
            ...analysisResult,
            creditsLeft: userCredits.resumeAnalysisCredits,
            plan: userCredits.plan
        }, "Resume analyzed successfully")
    );
});

// ... existing imports
// Add this new function
const getCreditsController = asyncHandler(async (req, res) => {
    const user = req.user;
    
    let userCredits = await Credits.findOne({ userId: user._id });

    // Self-healing: If credits don't exist yet, create them with defaults
    if (!userCredits) {
        const limit = (user.subscription === 'premium' || user.subscription === 'premium pro') ? 50 : 3;
        userCredits = await Credits.create({ 
            userId: user._id, 
            plan: user.subscription,
            resumeAnalysisCredits: limit,
            jdKeywordsCredits: limit,
            resetAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
    }

    return res.status(200).json(
        new ApiResponse(200, {
            resumeCredits: userCredits.resumeAnalysisCredits,
            jdCredits: userCredits.jdKeywordsCredits, // <--- This is what we need
            plan: userCredits.plan
        }, "Credits fetched successfully")
    );
});

// Update the export to include it
export { analyzeResumeController, getCreditsController };