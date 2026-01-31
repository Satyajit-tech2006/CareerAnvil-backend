import { Router } from 'express';
import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser,
    forgotPassword,
    resetPasswordWithOtp, // Import the new controller
    updateAccountDetails,
    googleAuthCallback
} from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

import passport from "passport";
import "../passport/googleStrategy.js"; 

const router = Router();

// Public Routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

// Forgot Password Flow
router.route("/forgot-password").post(forgotPassword); // Step 1: Send Email
router.route("/reset-password").post(resetPasswordWithOtp); // Step 2: Verify OTP & Change Pass

// Protected Routes (Require Login)
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-profile").patch(verifyJWT, updateAccountDetails);

// Google Auth
router.get("/auth/google", passport.authenticate("google", { 
    scope: ["profile", "email"],
    session: false 
}));

router.get("/auth/google/callback", 
    passport.authenticate("google", { 
        session: false,
        failureRedirect: "https://career-anvil.vercel.app/login" 
    }), 
    googleAuthCallback
);

export default router;