import mongoose from "mongoose";

const { Schema, model } = mongoose;

const sectionSchema = new Schema({
    sheetId: {
        type: Schema.Types.ObjectId,
        ref: "Sheet",
        required: true
    },

    title: {
        type: String,
        required: true
    },

    order: {
        type: Number,
        required: true
    },

    totalItems: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

export const Section = model("Section", sectionSchema);
