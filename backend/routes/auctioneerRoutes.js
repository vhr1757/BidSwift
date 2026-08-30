import express from "express";

import {
    getAllAuctioneers,
    getAuctioneerByID,
    createAuctioneer,
    updateAuctioneer,
    deleteAuctioneer
} from "../controllers/auctioneerController.js";

const router = express.Router();

router.get("/", getAllAuctioneers);

router.get("/:id", getAuctioneerByID);

router.post("/", createAuctioneer);

router.put("/:id", updateAuctioneer);

router.delete("/:id", deleteAuctioneer);

export default router;