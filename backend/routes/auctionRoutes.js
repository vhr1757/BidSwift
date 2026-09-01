import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import authorizeRoles from "../middlewares/roleMiddleware.js";

import {
    getAllAuctions,
    getAuctionByID,
    createAuction,
    updateAuction,
    deleteAuction
} from "../controllers/auctionController.js";

const router = express.Router();

router.get("/", getAllAuctions);

router.get("/:id", getAuctionByID);

router.post(
    "/",
    authMiddleware,
    authorizeRoles("auctioneer"),
    createAuction
);

router.put(
    "/:id",
    authMiddleware,
    authorizeRoles("auctioneer", "admin"),
    updateAuction
);

router.delete(
    "/:id",
    authMiddleware,
    authorizeRoles("auctioneer", "admin"),
    deleteAuction
);

export default router;