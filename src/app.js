import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express();

// 1. Security Headers
app.use(helmet()); 

// 2. Rate Limiting (Prevent Brute Force/DDoS)
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 1000, // Limit each IP to 1000 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests, please try again later."
});
app.use(limiter);

// 3. CORS Configuration
app.use(cors({
    origin: [
        "http://localhost:8080", // Frontend Dev
        "https://careeranvil.com", // Production Domain (Placeholder)
        "https://www.careeranvil.com"
    ],
    credentials: true
}));

// 4. Body Parsers
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// --- Import Routers ---
import userRouter from "./routes/user.route.js"; 

// --- Mount Routers ---
app.use("/api/v1/users", userRouter);

// --- Global Error Handler ---
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log error stack in development for debugging
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