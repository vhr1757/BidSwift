import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import authorizeRoles from "../middlewares/roleMiddleware.js";

import {
    getAllBids,
    getBidByID,
    createBid
} from "../controllers/bidController.js";

const router = express.Router();

router.get("/", getAllBids);

router.get("/:id", getBidByID);

router.post(
    "/",
    authMiddleware,
    authorizeRoles("buyer"),
    createBid
);

export default router;