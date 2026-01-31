import { Payment } from "../models/payment.model.js";
import { User } from "../models/user.model.js";
import { Credits } from "../models/credits.model.js"; // Ensure you have this model
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// 1. INITIATE PAYMENT (Create Intent)
// ... imports

export const initiatePayment = asyncHandler(async (req, res) => {
    const { plan, billingCycle } = req.body; // <--- Receive billingCycle

    // 1. Validate Plan
    if (plan !== "premium") {
        throw new ApiError(400, "Invalid plan selected");
    }

    // 2. Determine Amount
    let amount = 99; // Default Monthly
    if (billingCycle === "yearly") {
        amount = 999;
    }

    // 3. Check for existing active intents
    const existingPayment = await Payment.findOne({
        userId: req.user._id,
        status: { $in: ["pending_utr", "pending_verification"] },
        expiresAt: { $gt: Date.now() }
    });

    if (existingPayment) {
        if (existingPayment.status === "pending_utr") {
             // Optional: Update amount if they changed cycle? For safety, just return existing.
             return res.status(200).json(new ApiResponse(200, existingPayment, "Resumed existing payment session"));
        }
        throw new ApiError(409, "You have a payment verification in progress.");
    }

    const payment = await Payment.create({
        userId: req.user._id,
        plan,
        amount,
        status: "pending_utr",
        note: billingCycle // Optional: store cycle in note
    });

    return res.status(201).json(new ApiResponse(201, payment, "Payment initiated"));
});

// ... rest of the controller

// 2. SUBMIT UTR (User Action)
export const submitUTR = asyncHandler(async (req, res) => {
    const { utr, paymentId } = req.body;

    // A. Validate UTR Format (12-22 alphanumeric characters)
    if (!utr || !/^[A-Za-z0-9]{12,22}$/.test(utr)) {
        throw new ApiError(400, "Invalid UTR format. It must be 12-22 alphanumeric characters.");
    }

    // B. Check if UTR is already used globally
    const utrExists = await Payment.findOne({ utr });
    if (utrExists) {
        throw new ApiError(409, "This UTR has already been submitted.");
    }

    // C. Find Payment Record
    const payment = await Payment.findById(paymentId);
    if (!payment) {
        throw new ApiError(404, "Transaction record not found");
    }

    // D. Security Check: Ownership
    if (payment.userId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized");
    }

    // E. State Check (Prevent double submission)
    if (payment.status !== "pending_utr") {
        throw new ApiError(400, "This payment is already processing or finalized.");
    }

    // F. Update
    payment.utr = utr;
    payment.status = "pending_verification";
    await payment.save();

    return res.status(200).json(new ApiResponse(200, payment, "UTR submitted! Verification pending."));
});

// 3. GET ACTIVE STATUS (Frontend Polling)
export const getActivePayment = asyncHandler(async (req, res) => {
    // Find latest active payment
    const payment = await Payment.findOne({
        userId: req.user._id,
        status: { $in: ["pending_utr", "pending_verification"] },
        expiresAt: { $gt: Date.now() }
    }).sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, payment, "Active payment fetched"));
});

// 4. ADMIN VERIFY (The "Approve" Button)
export const adminVerifyPayment = asyncHandler(async (req, res) => {
    const { paymentId, action } = req.body; // action: 'approve' | 'reject'

    // A. Security: Admin Only
    if (req.user.role !== "admin") {
        throw new ApiError(403, "Access Denied. Admins only.");
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) throw new ApiError(404, "Payment not found");

    if (payment.status !== "pending_verification") {
        throw new ApiError(400, "Payment is not pending verification.");
    }

    if (action === "approve") {
        payment.status = "approved";
        payment.verifiedBy = req.user._id;

        // B. Update User Subscription
        await User.findByIdAndUpdate(payment.userId, {
            subscription: payment.plan
        });
        
        // C. Update CREDITS Model (Single Source of Truth)
        // Determine credit limits based on plan
        const limit = payment.plan === "premium_pro" ? 100 : 50;
        
        // Upsert Credits (Create if doesn't exist, Update if it does)
        await Credits.findOneAndUpdate(
            { userId: payment.userId },
            {
                $set: {
                    plan: payment.plan,
                    resumeAnalysisCredits: limit,
                    jdKeywordsCredits: limit,
                    // Reset date: 30 days from now
                    resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
                }
            },
            { upsert: true, new: true }
        );

    } else if (action === "reject") {
        payment.status = "rejected";
        payment.verifiedBy = req.user._id;
    } else {
        throw new ApiError(400, "Invalid action");
    }

    await payment.save();

    return res.status(200).json(new ApiResponse(200, {}, `Payment ${action}d successfully`));
});

export const getAllPayments = asyncHandler(async (req, res) => {
    if (req.user.role !== "admin") throw new ApiError(403, "Admin only");
    
    const { status } = req.query;
    const filter = status ? { status } : {};

    const payments = await Payment.find(filter)
        .populate("userId", "name email") // Show user details
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, payments, "Payments fetched"));
});

