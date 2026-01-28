import 'dotenv/config';
import connectDB from "./db/index.js";
import app from "./app.js";
import http from 'http';
import { Server } from 'socket.io';
import './models/user.model.js'; 

// 1. Connect to Database (Executes for both Local and Vercel)
connectDB();

const PORT = process.env.PORT || 8000;

// 2. Local Development & VPS Configuration
// (This block is SKIPPED by Vercel to prevent crashes)
if (process.env.NODE_ENV !== "production") {
    const server = http.createServer(app);

    const allowedOrigins = [
        "http://localhost:8080",
        "http://localhost:5173",
        "https://careeranvil.com",
        "https://www.careeranvil.com"
    ];

    const io = new Server(server, {
        cors: {
            origin: allowedOrigins,
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // initSocket(io);

    server.listen(PORT, () => {
        console.log(`🚀 CareerAnvil Server running on port ${PORT}`);
    });

    server.on("error", (err) => console.error("Server error:", err));
}

// 3. Export App for Vercel Serverless
export default app;