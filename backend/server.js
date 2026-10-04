import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import express from "express";
import "dotenv/config";
import cors from "cors";
import { createServer } from "http";
import { initializeSocket } from "./config/socket.js";
import connectDB from "./config/db.js";
import redisClient from "./config/redis.js";
import startOrderExpiryService from "./utils/orderExpiryService.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import buyerRoutes from "./routes/buyerRoutes.js";
import auctioneerRoutes from "./routes/auctioneerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import auctionRoutes from "./routes/auctionRoutes.js";
import billRoutes from "./routes/billRoutes.js";
import bidRoutes from "./routes/bidRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";


const app = express();
app.use(express.json());

const httpServer = createServer(app);

const PORT = process.env.PORT || 3000;

app.use(
    cors({
        origin: "http://localhost:5173"
    })
);

await redisClient.connect();
console.log("Redis connected successfully");

const io = await initializeSocket(
    httpServer
);

connectDB();

startOrderExpiryService();

io.on("connection", (socket) => {
    console.log(
        "Socket connected:",
        socket.id
    );

    socket.on(
        "joinAuction",
        (auctionId) => {

            const roomName =
                `auction:${auctionId}`;

            socket.join(roomName);

            console.log(
                `Socket ${socket.id} joined ${roomName}`
            );

        }
    );

    socket.on(
        "leaveAuction",
        (auctionId) => {

            const roomName =
                `auction:${auctionId}`;

            socket.leave(roomName);

            console.log(
                `Socket ${socket.id} left ${roomName}`
            );

        }
    );

    socket.on("disconnect", () => {
        console.log(
            "Socket disconnected:",
            socket.id
        );
    });
});

app.get("/", (req, res) => {
    res.send("BidSwift Backend is Running");
});

app.use("/api/sellers", sellerRoutes);

app.use("/api/buyers", buyerRoutes);

app.use("/api/auctioneers", auctioneerRoutes);

app.use("/api/auctions", auctionRoutes);

app.use("/api/admins", adminRoutes);

app.use("/api/items", itemRoutes);

app.use("/api/auth", authRoutes);
    
app.use("/api/bills", billRoutes);

app.use("/api/bids", bidRoutes);

app.use("/api/wallets", walletRoutes);

app.use("/api/orders", orderRoutes);

httpServer.listen(
    PORT,
    () => {
        console.log(
            `Server running on port ${PORT}`
        );
    }
);