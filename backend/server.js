const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const sellerRoutes = require("./routes/sellerRoutes");
const buyerRoutes = require("./routes/buyerRoutes");
const auctioneerRoutes = require("./routes/auctioneerRoutes");
const adminRoutes = require("./routes/adminRoutes");

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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});