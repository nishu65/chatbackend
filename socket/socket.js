import dotenv from "dotenv";
dotenv.config();

import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();

const server = http.createServer(app);
console.log("url ", process.env.CLIENT_URL);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
  },
});

const userSocketMap = {
    // userId : socketId,
}

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("userId ", userId);

  if (!userId) return;

  userSocketMap[userId] = socket.id;

  io.emit("onlineUsers", Object.keys(userSocketMap))

  socket.on("join", (roomId) => {
    socket.join(roomId);
    console.log(`👤 User ${socket.id} joined room ${roomId}`);
  });
  

  socket.on("send_message", ({ receiverId, message }) => {
    console.log(`📤 Sending message to ${receiverId}:`, message);
    io.to(receiverId).emit("receive_message", message);
  });


  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("onlineUsers", Object.keys(userSocketMap));
  });
});

const getSocketId = (userId) =>{
    return userSocketMap[userId];
}

export { io, app, server, getSocketId };
