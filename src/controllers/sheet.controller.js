import { Sheet } from '../models/sheet.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const createSheet = asyncHandler(async (req, res) => {
    const { title, slug, description, type } = req.body;

    if (!title || !slug || !type) {
        throw new ApiError(400, "Title, Slug, and Type are required");
    }

    const existingSheet = await Sheet.findOne({ slug });
    if (existingSheet) {
        throw new ApiError(409, "Sheet with this slug already exists");
    }

    const sheet = await Sheet.create({
        title,
        slug,
        description,
        type, 
        totalItems: 0 
    });

    return res.status(201).json(
        new ApiResponse(201, sheet, "Sheet created successfully")
    );
});

const getAllSheets = asyncHandler(async (req, res) => {
    const { type } = req.query;
    const query = type ? { type } : {};

    const sheets = await Sheet.find(query).sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, sheets, "Sheets fetched successfully")
    );
});

const getSheetBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const sheet = await Sheet.findOne({ slug });

    if (!sheet) {
        throw new ApiError(404, "Sheet not found");
    }

    return res.status(200).json(
        new ApiResponse(200, sheet, "Sheet details fetched")
    );
});

const updateSheet = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const sheet = await Sheet.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true }
    );

    if (!sheet) {
        throw new ApiError(404, "Sheet not found");
    }

    return res.status(200).json(
        new ApiResponse(200, sheet, "Sheet updated successfully")
    );
});

const deleteSheet = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const sheet = await Sheet.findByIdAndDelete(id);

    if (!sheet) {
        throw new ApiError(404, "Sheet not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Sheet deleted successfully")
    );
});

export {
    createSheet,
    getAllSheets,
    getSheetBySlug,
    updateSheet,
    deleteSheet
};