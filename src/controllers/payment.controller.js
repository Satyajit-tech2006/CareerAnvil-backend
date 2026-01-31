import { Payment } from "../models/payment.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// 1. Initiate (Check for existing and create intent)
export const initiatePayment = asyncHandler(async (req, res) => {
    const { plan } = req.body;

    // Check if user has any unresolved transaction
    const existingPayment = await Payment.findOne({
        userId: req.user._id,
        status: { $in: ["pending_utr", "pending_verification"] }
    });

    if (existingPayment) {
        throw new ApiError(400, "You already have a pending transaction. Please complete or wait for verification.");
    }

    const amount = plan === "premium_pro" ? 499 : 299;

    const payment = await Payment.create({
        userId: req.user._id,
        plan,
        amount,
        status: "pending_utr"
    });

    return res.status(201).json(new ApiResponse(201, payment, "Payment initiated"));
});

// 2. Submit UTR
export const submitUTR = asyncHandler(async (req, res) => {
    const { utr, paymentId } = req.body;

    if (!utr || utr.length < 12) {
        throw new ApiError(400, "Please enter a valid 12-digit UTR/Ref No.");
    }

    // Check if this UTR was used before by anyone
    const utrExists = await Payment.findOne({ utr });
    if (utrExists) {
        throw new ApiError(409, "This UTR has already been submitted.");
    }

    const payment = await Payment.findById(paymentId);
    if (!payment || payment.userId.toString() !== req.user._id.toString()) {
        throw new ApiError(404, "Transaction not found");
    }

    payment.utr = utr;
    payment.status = "pending_verification";
    await payment.save();

    return res.status(200).json(new ApiResponse(200, payment, "UTR submitted for verification"));
});

// 3. Get Current Status
export const getActivePayment = asyncHandler(async (req, res) => {
    const payment = await Payment.findOne({
        userId: req.user._id,
        status: { $in: ["pending_utr", "pending_verification"] }
    }).sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, payment, "Active payment fetched"));
});