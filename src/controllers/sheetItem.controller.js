import { SheetItem } from '../models/sheetItem.model.js';
import { Section } from '../models/section.model.js';
import { Sheet } from '../models/sheet.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// ============================================================================
// 1. CREATE ITEM (And update counts)
// ============================================================================
const createItem = asyncHandler(async (req, res) => {
    const { sheetId, sectionId, title, type, difficulty, externalLink, tags, order } = req.body;

    if (!sheetId || !sectionId || !title || order === undefined) {
        throw new ApiError(400, "Sheet ID, Section ID, Title, and Order are required");
    }

    // 1. Verify Parent Section exists
    const section = await Section.findById(sectionId);
    if (!section) {
        throw new ApiError(404, "Parent Section not found");
    }

    // 2. Create the Item
    const item = await SheetItem.create({
        sheetId,
        sectionId,
        title,
        type: type || 'problem', // problem, article, video
        difficulty, // easy, medium, hard
        externalLink,
        tags,
        order
    });

    // 3. AUTO-UPDATE COUNTS (Crucial for Progress Tracking)
    // Increment Section Count
    await Section.findByIdAndUpdate(sectionId, { $inc: { totalItems: 1 } });
    // Increment Sheet Count
    await Sheet.findByIdAndUpdate(sheetId, { $inc: { totalItems: 1 } });

    return res.status(201).json(
        new ApiResponse(201, item, "Item created and counts updated")
    );
});

// ============================================================================
// 2. GET ITEMS BY SECTION
// ============================================================================
const getItemsBySection = asyncHandler(async (req, res) => {
    const { sectionId } = req.params;

    const items = await SheetItem.find({ sectionId }).sort({ order: 1 });

    return res.status(200).json(
        new ApiResponse(200, items, "Items fetched successfully")
    );
});

// ============================================================================
// 3. UPDATE ITEM
// ============================================================================
const updateItem = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const item = await SheetItem.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true }
    );

    if (!item) {
        throw new ApiError(404, "Item not found");
    }

    return res.status(200).json(
        new ApiResponse(200, item, "Item updated successfully")
    );
});

// ============================================================================
// 4. DELETE ITEM (And decrement counts)
// ============================================================================
const deleteItem = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const item = await SheetItem.findByIdAndDelete(id);

    if (!item) {
        throw new ApiError(404, "Item not found");
    }

    // AUTO-UPDATE COUNTS
    // Decrement Section Count
    await Section.findByIdAndUpdate(item.sectionId, { $inc: { totalItems: -1 } });
    // Decrement Sheet Count
    await Sheet.findByIdAndUpdate(item.sheetId, { $inc: { totalItems: -1 } });

    return res.status(200).json(
        new ApiResponse(200, {}, "Item deleted and counts updated")
    );
});

export {
    createItem,
    getItemsBySection,
    updateItem,
    deleteItem
};