import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import redisClient from "./redis.js";

let io = null;

const initializeSocket = async (httpServer) => {
  const pubClient = redisClient.duplicate();

  const subClient = redisClient.duplicate();

  await Promise.all([pubClient.connect(), subClient.connect()]);

  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.adapter(createAdapter(pubClient, subClient));

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }

  return io;
};

export { initializeSocket, getIO };
