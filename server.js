// server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./db/connection1.db.js";

// Import routes
import userRoute from "./routes/user.route.js";
import messageRoute from "./routes/message.route.js";

// Import socket server setup
import { createSocketServer } from "./socket/socket.js";

const app = express();
const PORT = process.env.PORT || 5100;

connectDB();

console.log("Client URL:", process.env.CLIENT_URL);

// CORS middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// API routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/message", messageRoute);

// Error handling middleware (imported somewhere in your code)
import { errorMiddleware } from "./middlewares/error.middlware.js";
app.use(errorMiddleware);

// Create HTTP server and Socket.io server
const server = createSocketServer(app);

// Start server
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
