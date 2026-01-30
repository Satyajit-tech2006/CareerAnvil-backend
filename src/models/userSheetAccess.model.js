import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSheetAccessSchema = new Schema({
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

    unlocked: {
        type: Boolean,
        default: false
    },

    unlockedAt: Date
}, { timestamps: true });

userSheetAccessSchema.index({ userId: 1, sheetId: 1 }, { unique: true });

export const UserSheetAccess = model("UserSheetAccess", userSheetAccessSchema);
