import mongoose from "mongoose";

const { Schema, model } = mongoose;

const creditsSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },

    plan: {
        type: String,
        enum: ["freemium", "premium","premium_pro"],
        default: "freemium"
    },

    resumeAnalysisCredits: {
        type: Number,
        default: 3   // free users: 3 per week or per reset cycle
    },
    jdKeywordsCredits: {
        type: Number,
        default: 3   // Free: 3/week, Premium: 50/week
    },
    resetAt: {
        type: Date,  // when credits reset
        required: true
    }
}, { timestamps: true });

export const Credits = model("Credits", creditsSchema);
