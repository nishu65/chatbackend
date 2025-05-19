// socket.js
import http from "http";
import { Server } from "socket.io";

let io; // Will hold the socket.io server instance
const userSocketMap = {};

export function createSocketServer(app) {
  const server = http.createServer(app);

  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("User connected with userId:", userId);

    if (!userId) return;

    userSocketMap[userId] = socket.id;

    io.emit("onlineUsers", Object.keys(userSocketMap));

    socket.on("join", (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on("send_message", ({ receiverId, message }) => {
      console.log(`Sending message to ${receiverId}:`, message);
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive_message", message);
      }
    });

    socket.on("disconnect", () => {
      delete userSocketMap[userId];
      io.emit("onlineUsers", Object.keys(userSocketMap));
      console.log(`User ${userId} disconnected`);
    });
  });

  return server;
}

// Export io instance (once initialized)
export { io };

// Export getSocketId utility
export function getSocketId(userId) {
  return userSocketMap[userId];
}
