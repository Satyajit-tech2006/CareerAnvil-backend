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
        unique: true, // Prevents using the same UTR twice
        sparse: true  // Allows null for intents that haven't submitted UTR yet
    },
    status: {
        type: String,
        enum: ["pending_utr", "pending_verification", "approved", "rejected"],
        default: "pending_utr"
    },
    note: String
}, { timestamps: true });

export const Payment = mongoose.model("Payment", paymentSchema);