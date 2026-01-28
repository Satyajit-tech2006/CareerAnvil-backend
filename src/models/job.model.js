import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const jobSchema = new Schema({
    title: { 
        type: String,
        required: true,
        trim: true, // e.g., "SDE Intern"
    },
    company: {
        type: String,
        required: true,
        trim: true, // e.g., "Google"
    },
    link: { 
        type: String,
        required: true, // The most important field: Where the button takes them
    },
    type: {
        type: String,
        enum: ['tech', 'non-tech'],
        default: 'tech',
    },
    eligibility: {
        type: String, 
        required: true // e.g., "2026 Batch, CSE/IT"
    },
    lastDate: {
        type: Date, // Optional: Just so users know if it's urgent
    }
}, { timestamps: true });

export const Job = model('Job', jobSchema);