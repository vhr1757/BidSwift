const express = require("express");

const {
    getAllBuyers,
    getBuyerByID,
    createBuyer,
    updateBuyer,
    deleteBuyer
} = require("../controllers/buyerController");

const router = express.Router();

router.get("/", getAllBuyers);

router.get("/:id", getBuyerByID);

router.post("/", createBuyer);

router.put("/:id", updateBuyer);

router.delete("/:id", deleteBuyer);

module.exports = router;