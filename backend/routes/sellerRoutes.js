const express = require("express");

const {
    getAllSellers,
    getSellerByID,
    createSeller,
    updateSeller,
    deleteSeller
} = require("../controllers/sellerController");

const router = express.Router();

router.get("/", getAllSellers);

router.get("/:id", getSellerByID);

router.post("/", createSeller);

router.put("/:id", updateSeller);

router.delete("/:id", deleteSeller);

module.exports = router;