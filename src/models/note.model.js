import mongoose from "mongoose";

const { Schema, model } = mongoose;

const noteSchema = new Schema({
    sheetId: {
        type: Schema.Types.ObjectId,
        ref: "Sheet",
        required: true
    },
    itemId: {
        type: Schema.Types.ObjectId,
        ref: "SheetItem",
        required: true,
        unique: true // One note per problem
    },
    title: {
        type: String, 
        required: true
    },
    content: {
        type: String, // We will store rich HTML string here
        required: true
    },
    isPublished: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export const Note = model("Note", noteSchema);