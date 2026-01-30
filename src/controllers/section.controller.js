import { Section } from '../models/section.model.js';
import { Sheet } from '../models/sheet.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const createSection = asyncHandler(async (req, res) => {
    const { sheetId, title, order } = req.body;

    if (!sheetId || !title || order === undefined) {
        throw new ApiError(400, "Sheet ID, Title, and Order are required");
    }

    const sheetExists = await Sheet.findById(sheetId);
    if (!sheetExists) {
        throw new ApiError(404, "Parent Sheet not found");
    }

    const section = await Section.create({
        sheetId,
        title,
        order,
        totalItems: 0
    });

    return res.status(201).json(
        new ApiResponse(201, section, "Section created successfully")
    );
});

const getSectionsBySheet = asyncHandler(async (req, res) => {
    const { sheetId } = req.params;

    const sections = await Section.find({ sheetId }).sort({ order: 1 });

    return res.status(200).json(
        new ApiResponse(200, sections, "Sections fetched successfully")
    );
});

const updateSection = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const section = await Section.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true }
    );

    if (!section) {
        throw new ApiError(404, "Section not found");
    }

    return res.status(200).json(
        new ApiResponse(200, section, "Section updated successfully")
    );
});

const deleteSection = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const section = await Section.findByIdAndDelete(id);

    if (!section) {
        throw new ApiError(404, "Section not found");
    }

    // Optional: Logic to delete all Items inside this section could go here
    
    return res.status(200).json(
        new ApiResponse(200, {}, "Section deleted successfully")
    );
});

export {
    createSection,
    getSectionsBySheet,
    updateSection,
    deleteSection
};