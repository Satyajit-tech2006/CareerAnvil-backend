import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSheetStatsSchema = new Schema({
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

    completedItems: {
        type: Number,
        default: 0
    },

    totalItems: {
        type: Number,
        required: true
    },

    completionPercentage: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

userSheetStatsSchema.index(
    { userId: 1, sheetId: 1 },
    { unique: true }
);

export const UserSheetStats = model("UserSheetStats", userSheetStatsSchema);
