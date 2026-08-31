import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import authorizeRoles from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get(
    "/protected",
    authMiddleware,
    authorizeRoles("seller"),
    (req, res) => {
        res.status(200).json({
            message: "Seller access granted",
            user: req.user
        });
    }
);

export default router;