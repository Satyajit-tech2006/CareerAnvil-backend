import { UserSheetAccess } from '../models/userSheetAccess.model.js';
import { UserSheetStats } from '../models/userSheetStats.model.js';
import { Sheet } from '../models/sheet.model.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import mongoose from 'mongoose';

const enrollUser = asyncHandler(async (req, res) => {
    const { sheetId } = req.body;
    const userId = req.user._id;

    // Check if already enrolled
    const existing = await UserSheetAccess.findOne({ userId, sheetId });
    if (existing) {
        return res.status(200).json(new ApiResponse(200, existing, "Already enrolled"));
    }

    const enrollment = await UserSheetAccess.create({
        userId,
        sheetId,
        unlocked: true,
        unlockedAt: new Date()
    });

    // Initialize stats to 0 so MyLearning doesn't crash on new enrollments
    await UserSheetStats.create({
        userId,
        sheetId,
        completedItems: 0,
        totalItems: (await Sheet.findById(sheetId)).totalItems || 0,
        completionPercentage: 0
    });

    return res.status(201).json(new ApiResponse(201, enrollment, "Enrolled successfully"));
});

// UPDATED: Fetches Enrollment + Stats for the Progress Bar
const getEnrolledSheets = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // We use aggregation to join UserSheetAccess with UserSheetStats
    const enrollments = await UserSheetAccess.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
            $lookup: {
                from: "sheets", // Join with Sheets to get Title/Desc
                localField: "sheetId",
                foreignField: "_id",
                as: "sheet"
            }
        },
        { $unwind: "$sheet" }, // Flatten the sheet array
        {
            $lookup: {
                from: "usersheetstats", // Join with Stats to get Progress
                let: { sheetId: "$sheetId", userId: "$userId" },
                pipeline: [
                    { $match: { $expr: { $and: [
                        { $eq: ["$sheetId", "$$sheetId"] },
                        { $eq: ["$userId", "$$userId"] }
                    ]}}}
                ],
                as: "stats"
            }
        },
        {
            $addFields: {
                // Add the completed count to the root object for Frontend
                completedItemsCount: { $ifNull: [ { $arrayElemAt: ["$stats.completedItems", 0] }, 0 ] }
            }
        },
        { $sort: { updatedAt: -1 } }
    ]);

    return res.status(200).json(
        new ApiResponse(200, enrollments, "Fetched enrolled sheets")
    );
});

export { enrollUser, getEnrolledSheets };