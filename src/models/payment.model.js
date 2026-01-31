import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    plan: {
        type: String,
        enum: ["premium", "premium_pro"],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    utr: {
        type: String,
        unique: true, // Prevents reusing UTRs
        sparse: true, // Allows null/undefined for pending intents
        trim: true
    },
    status: {
        type: String,
        enum: ["pending_utr", "pending_verification", "approved", "rejected"],
        default: "pending_utr"
    },
    expiresAt: {
        type: Date,
        index: true,
        default: () => new Date(Date.now() + 30 * 60 * 1000) // Auto-expire after 30 mins
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User" // Admin who verified this
    },
    note: String
}, { timestamps: true });

export const Payment = mongoose.model("Payment", paymentSchema);