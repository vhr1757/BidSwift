import express from "express";

import {
    getAllSellers,
    getSellerByID,
    createSeller,
    updateSeller,
    deleteSeller
} from "../controllers/sellerController.js";

const router = express.Router();

router.get("/", getAllSellers);

router.get("/:id", getSellerByID);

router.post("/", createSeller);

router.put("/:id", updateSeller);

router.delete("/:id", deleteSeller);

export default router;