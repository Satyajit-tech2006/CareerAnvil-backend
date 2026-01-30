import mongoose from "mongoose";

const { Schema, model } = mongoose;

const sheetSchema = new Schema({
    title: {
        type: String,
        required: true
    },

    slug: {
        type: String,
        required: true,
        unique: true
    },

    description: String,

    type: {
        type: String,
        enum: ["free", "premium"],
        required: true
    },

    totalItems: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

export const Sheet = model("Sheet", sheetSchema);
