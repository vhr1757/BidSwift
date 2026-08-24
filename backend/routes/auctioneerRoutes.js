const express = require("express");

const {
    getAllAuctioneers,
    getAuctioneerByID,
    createAuctioneer,
    updateAuctioneer,
    deleteAuctioneer
} = require("../controllers/auctioneerController");

const router = express.Router();

router.get("/", getAllAuctioneers);

router.get("/:id", getAuctioneerByID);

router.post("/", createAuctioneer);

router.put("/:id", updateAuctioneer);

router.delete("/:id", deleteAuctioneer);

module.exports = router;