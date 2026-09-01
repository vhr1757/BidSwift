import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import authorizeRoles from "../middlewares/roleMiddleware.js";

import {
    getAllBids,
    getBidByID,
    createBid,
    updateBid,
    deleteBid
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

router.put(
    "/:id",
    authMiddleware,
    authorizeRoles("buyer"),
    updateBid
);

router.delete(
    "/:id",
    authMiddleware,
    authorizeRoles("buyer", "admin"),
    deleteBid
);

export default router;