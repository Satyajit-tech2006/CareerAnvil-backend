import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userItemProgressSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

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

    itemId: {
        type: Schema.Types.ObjectId,
        ref: "SheetItem",
        required: true
    },

    status: {
        type: String,
        enum: ["todo", "done", "revisit"],
        default: "todo"
    },

    notes: {
        type: String
    }
}, { timestamps: true });

userItemProgressSchema.index(
    { userId: 1, itemId: 1 },
    { unique: true }
);

export const UserItemProgress = model("UserItemProgress", userItemProgressSchema);
