import { UserItemProgress } from '../models/userItemProgress.model.js';
import { UserSheetStats } from '../models/userSheetStats.model.js';
import { Sheet } from '../models/sheet.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// ============================================================================
// 1. TOGGLE ITEM STATUS (The "Checkbox" Logic)
// ============================================================================
const toggleItemStatus = asyncHandler(async (req, res) => {
    const { sheetId, sectionId, itemId, status } = req.body; // status: 'done', 'todo', 'revisit'
    const userId = req.user._id;

    if (!sheetId || !sectionId || !itemId || !status) {
        throw new ApiError(400, "All fields (sheetId, sectionId, itemId, status) are required");
    }

    // A. Update/Upsert the Item Progress
    const progress = await UserItemProgress.findOneAndUpdate(
        { userId, itemId },
        { 
            userId, 
            sheetId, 
            sectionId, 
            itemId, 
            status 
        },
        { upsert: true, new: true } // Create if doesn't exist
    );

    // B. Recalculate Stats for this Sheet
    // 1. Get total items marked as "done" for this user & sheet
    const completedCount = await UserItemProgress.countDocuments({
        userId,
        sheetId,
        status: 'done'
    });

    // 2. Get total items in the sheet (from Sheet model)
    const sheet = await Sheet.findById(sheetId);
    if (!sheet) throw new ApiError(404, "Sheet not found");

    const totalItems = sheet.totalItems || 1; // Avoid division by zero
    const percentage = Math.round((completedCount / totalItems) * 100);

    // 3. Update the Stats Table
    const stats = await UserSheetStats.findOneAndUpdate(
        { userId, sheetId },
        {
            userId,
            sheetId,
            completedItems: completedCount,
            totalItems: totalItems,
            completionPercentage: percentage
        },
        { upsert: true, new: true }
    );

    return res.status(200).json(
        new ApiResponse(200, { progress, stats }, "Progress updated")
    );
});

// ============================================================================
// 2. GET USER PROGRESS (For painting the checkboxes on load)
// ============================================================================
const getSheetProgress = asyncHandler(async (req, res) => {
    const { sheetId } = req.params;
    const userId = req.user._id;

    // Get all progress entries for this sheet (only the ones user interacted with)
    const progressMap = await UserItemProgress.find({ userId, sheetId });
    
    // Get the aggregate stats
    const stats = await UserSheetStats.findOne({ userId, sheetId });

    return res.status(200).json(
        new ApiResponse(200, { progressMap, stats }, "Progress fetched")
    );
});

export { toggleItemStatus, getSheetProgress };