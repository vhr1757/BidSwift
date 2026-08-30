import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import buyerRoutes from "./routes/buyerRoutes.js";
import auctioneerRoutes from "./routes/auctioneerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

connectDB();

app.get("/", (req, res) => {
    res.send("BidSwift Backend is Running");
});

app.use("/api/sellers", sellerRoutes);

app.use("/api/buyers", buyerRoutes);

app.use("/api/auctioneers", auctioneerRoutes);

app.use("/api/admins", adminRoutes);

app.use("/api/items", itemRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});