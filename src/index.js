import 'dotenv/config';
import connectDB from "./db/index.js";
import app from "./app.js";
import http from 'http';
import { Server } from 'socket.io';

// Import models explicitly to ensure Mongoose registers them
import './models/user.model.js'; 

connectDB()
.then(() => {
    const server = http.createServer(app);

    const allowedOrigins = [
        "http://localhost:5173",
        "https://careeranvil.com",
        "https://www.careeranvil.com"
    ];

    // Socket.io Setup (Ready for future features like Chat/Mock Interviews)
    const io = new Server(server, {
        cors: {
            origin: allowedOrigins,
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // TODO: Import and init socket handlers here later
    // initSocket(io);

    const PORT = process.env.PORT || 8000;

    server.listen(PORT, () => {
        console.log(`🚀 CareerAnvil Server running on port ${PORT}`);
    });

    server.on("error", (err) => console.error("Server error:", err));
})
.catch((error) => console.error("Error starting server:", error));