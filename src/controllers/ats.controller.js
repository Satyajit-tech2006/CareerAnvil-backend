import { analyzeResume } from "../services/ats.service.js";
import { User } from "../models/user.model.js";
import { Credits } from "../models/credits.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const analyzeResumeController = asyncHandler(async (req, res) => {
  // 1. Validate input
  if (!req.file) {
    throw new ApiError(400, "Resume PDF file is required");
  }

  const { role } = req.body;
  if (!role) {
    throw new ApiError(400, "Job role is required");
  }

  const userId = req.user._id;

  // 2. Credits check
  let credits = await Credits.findOne({ userId });

  if (!credits) {
    credits = await Credits.create({
      userId,
      plan: "freemium",
      resumeAnalysisCredits: 3,
      resetAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
  }

  if (credits.resumeAnalysisCredits <= 0) {
    throw new ApiError(403, "Weekly ATS analysis limit reached");
  }

  // 3. Analyze resume
  const result = await analyzeResume(req.file.buffer, role);

  // 4. Update credits + user
  credits.resumeAnalysisCredits -= 1;
  await credits.save();

  await User.findByIdAndUpdate(userId, {
    atsScore: result.score,
  });

  // 5. Respond
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ...result,
        creditsLeft: credits.resumeAnalysisCredits,
      },
      "Resume analyzed successfully"
    )
  );
});
