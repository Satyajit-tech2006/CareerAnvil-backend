import { Job } from '../models/job.model.js'; // Ensure correct import path
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// ============================================================================
// 1. CREATE JOB (Admin Only)
// ============================================================================
const createJob = asyncHandler(async (req, res) => {
    const { title, company, link, type, eligibility, lastDate } = req.body;

    if (!title || !company || !link || !eligibility) {
        throw new ApiError(400, "Title, Company, Link, and Eligibility are required");
    }

    const job = await Job.create({
        title,
        company,
        link,
        type: type || 'tech',
        eligibility,
        lastDate
    });

    return res.status(201).json(
        new ApiResponse(201, job, "Job posted successfully")
    );
});

// ============================================================================
// 2. GET ALL JOBS (Pagination: 10 per page)
// ============================================================================
const getAllJobs = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, type } = req.query;

    const query = {};
    if (type) {
        query.type = type; // Allow filtering by 'tech' or 'non-tech'
    }

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 }, // Show newest jobs first
    };

    // Calculate skip manually if not using mongoose-aggregate-paginate
    const skip = (options.page - 1) * options.limit;

    const jobs = await Job.find(query)
        .sort(options.sort)
        .skip(skip)
        .limit(options.limit);
        
    const totalJobs = await Job.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            jobs,
            currentPage: options.page,
            totalPages: Math.ceil(totalJobs / options.limit),
            totalJobs
        }, "Jobs fetched successfully")
    );
});

// ============================================================================
// 3. UPDATE JOB (Admin Only)
// ============================================================================
const updateJob = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const job = await Job.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true } // Return the updated document
    );

    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    return res.status(200).json(
        new ApiResponse(200, job, "Job updated successfully")
    );
});

// ============================================================================
// 4. DELETE JOB (Admin Only)
// ============================================================================
const deleteJob = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const job = await Job.findByIdAndDelete(id);

    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Job deleted successfully")
    );
});

// ============================================================================
// 5. CLEANUP OLD JOBS (> 30 Days)
// ============================================================================
const cleanupExpiredJobs = asyncHandler(async (req, res) => {
    // Calculate the date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Delete jobs created BEFORE that date
    const result = await Job.deleteMany({
        createdAt: { $lt: thirtyDaysAgo }
    });

    return res.status(200).json(
        new ApiResponse(200, { deletedCount: result.deletedCount }, `Cleanup complete. Deleted ${result.deletedCount} old jobs.`)
    );
});

export {
    createJob,
    getAllJobs,
    updateJob,
    deleteJob,
    cleanupExpiredJobs
};