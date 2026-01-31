import mongoose from "mongoose";

const { Schema, model } = mongoose;

const jobRoleSchema = new Schema({
    // The internal ID for the role (e.g., 'software_intern', 'backend_dev')
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    // The display name (e.g., "Software Engineer Intern")
    title: {
        type: String,
        required: true
    },
    // The category (e.g., "Engineering", "Data") - useful for filtering dropdowns later
    category: {
        type: String,
        enum: ['Engineering', 'Data', 'Design', 'Product','Infrastructure','Security','Marketing','Sales','HR','Finance'],
        default: 'Engineering'
    },
    // The "Global Fixed Keyword Set"
    keywords: [{
        type: String,
        trim: true,
        lowercase: true // Store normalized to make matching easier
    }],
    // Optional: We can add 'mandatory' vs 'nice_to_have' later if needed
    // For now, keeping it simple as per your requirements.
}, { timestamps: true });

export const JobRole = model("JobRole", jobRoleSchema);