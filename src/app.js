import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import passport from "passport"; // Added for Google Auth

const app = express();

app.use(helmet()); 

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, 
    max: 1000, 
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests, please try again later."
});
app.use(limiter);

app.use(cors({
    origin: [
        "http://localhost:8080",
        "http://localhost:5173",
        "https://career-anvil.vercel.app", 
        "https://www.career-anvil.vercel.app"
    ],
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Initialize Passport (Required for Google Login)
app.use(passport.initialize());

// --- Import Routers ---
import userRouter from "./routes/user.route.js"; 
import jobRouter from "./routes/job.route.js";

// --- Mount Routers ---
app.use("/api/v1/users", userRouter);
app.use("/api/v1/jobs", jobRouter)
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    if (process.env.NODE_ENV === "development") {
        console.error(err.stack);
    }

    return res.status(statusCode).json({
        success: false,
        message: message,
        errors: err.errors || [],
    });
});

export default app;