import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import express from "express";
import "dotenv/config";
import connectDB from "./config/db.js";
import redisClient from "./config/redis.js";
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

const PORT = process.env.PORT || 3000;

await redisClient.connect();
console.log("Redis connected successfully");

connectDB();

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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});