import { Router } from 'express';
import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser,
    forgotPassword,
    updateAccountDetails
} from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

import passport from "passport";
import "../passport/googleStrategy.js"; 
import { googleAuthCallback } from "../controllers/user.controller.js";



const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/forgot-password").post(forgotPassword);

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-profile").patch(verifyJWT, updateAccountDetails);


// 1. Route to Start Google Login
router.get("/auth/google", passport.authenticate("google", { 
    scope: ["profile", "email"],
    session: false // We use JWT, not sessions
}));

router.get("/auth/google/callback", 
    passport.authenticate("google", { 
        session: false,
        failureRedirect: "https://career-anvil.vercel.app/login" // Redirect if failed
    }), 
    googleAuthCallback
);



export default router;