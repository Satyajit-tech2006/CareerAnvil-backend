import { UserSheetAccess } from '../models/userSheetAccess.model.js';
import { Sheet } from '../models/sheet.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// ============================================================================
// 1. ENROLL IN SHEET (Start a Sheet)
// ============================================================================
const enrollUser = asyncHandler(async (req, res) => {
    const { sheetId } = req.body;
    const userId = req.user._id;

    const sheet = await Sheet.findById(sheetId);
    if (!sheet) throw new ApiError(404, "Sheet not found");

    // Logic: If sheet is premium, check subscription (Skipping for now, assuming open)
    
    const enrollment = await UserSheetAccess.create({
        userId,
        sheetId,
        unlocked: true,
        unlockedAt: new Date()
    });

    return res.status(201).json(
        new ApiResponse(201, enrollment, "Enrolled successfully")
    );
});

// ============================================================================
// 2. GET MY SHEETS (For Dashboard)
// ============================================================================
const getEnrolledSheets = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Fetch access records and populate the Sheet details
    const enrollments = await UserSheetAccess.find({ userId })
        .populate("sheetId") // <--- This fills in the Title, Description, etc.
        .sort({ updatedAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, enrollments, "Fetched enrolled sheets")
    );
});

export { enrollUser, getEnrolledSheets };