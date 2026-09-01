import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import authorizeRoles from "../middlewares/roleMiddleware.js";

import {
    getAllBills,
    getBillByID,
    createBill,
    updatePaymentStatus,
    deleteBill
} from "../controllers/billController.js";

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    authorizeRoles("buyer", "seller", "admin"),
    getAllBills
);

router.get(
    "/:id",
    authMiddleware,
    authorizeRoles("buyer", "seller", "admin"),
    getBillByID
);

router.post(
    "/",
    authMiddleware,
    authorizeRoles("admin"),
    createBill
);

router.put(
    "/:id/payment",
    authMiddleware,
    authorizeRoles("admin"),
    updatePaymentStatus
);

router.delete(
    "/:id",
    authMiddleware,
    authorizeRoles("admin"),
    deleteBill
);

export default router;