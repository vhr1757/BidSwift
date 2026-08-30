import express from "express";

import {
    getAllBuyers,
    getBuyerByID,
    createBuyer,
    updateBuyer,
    deleteBuyer
} from "../controllers/buyerController.js";

const router = express.Router();

router.get("/", getAllBuyers);

router.get("/:id", getBuyerByID);

router.post("/", createBuyer);

router.put("/:id", updateBuyer);

router.delete("/:id", deleteBuyer);

export default router;