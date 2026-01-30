import { Note } from '../models/note.model.js';
import { SheetItem } from '../models/sheetItem.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// ============================================================================
// 1. SAVE / UPDATE NOTE (Admin)
// ============================================================================
const saveNote = asyncHandler(async (req, res) => {
    const { itemId, content, title } = req.body;

    if (!itemId || !content) {
        throw new ApiError(400, "Item ID and Content are required");
    }

    // 1. Verify the Item exists
    const item = await SheetItem.findById(itemId);
    if (!item) throw new ApiError(404, "Sheet Item not found");

    // 2. Upsert the Note (Create if new, Update if exists)
    const note = await Note.findOneAndUpdate(
        { itemId },
        { 
            itemId,
            sheetId: item.sheetId, // Auto-link to parent sheet
            title: title || item.title, // Default to item title
            content,
            isPublished: true
        },
        { upsert: true, new: true }
    );

    // 3. Mark the Item as having an internal note
    // This helps the Frontend show the 'File' icon without fetching the whole note
    if (!item.hasNote) {
        item.hasNote = true;
        await item.save();
    }

    return res.status(200).json(
        new ApiResponse(200, note, "Note saved successfully")
    );
});

// ============================================================================
// 2. GET NOTE (Public/Admin)
// ============================================================================
const getNote = asyncHandler(async (req, res) => {
    const { itemId } = req.params;

    const note = await Note.findOne({ itemId });

    if (!note) {
        throw new ApiError(404, "Note not found");
    }

    return res.status(200).json(
        new ApiResponse(200, note, "Note fetched")
    );
});

export { saveNote, getNote };