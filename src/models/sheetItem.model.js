import mongoose from "mongoose";

const { Schema, model } = mongoose;

const sheetItemSchema = new Schema({
    sheetId: {
        type: Schema.Types.ObjectId,
        ref: "Sheet",
        required: true
    },
    sectionId: {
        type: Schema.Types.ObjectId,
        ref: "Section",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["problem", "article", "video"],
        default: "problem"
    },
    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"]
    },
    // The main link to LeetCode/CodingNinjas
    externalLink: String, 
    
    // --- NEW: TUF-style Resources ---
    youtubeLink: String,  // Admin provided video solution
    articleLink: String,  // Admin provided reading material/notes
    hasNote: {
        type: Boolean,
        default: false
    },
    tags: [String],
    order: {
        type: Number,
        required: true
    }
}, { timestamps: true });

export const SheetItem = model("SheetItem", sheetItemSchema);