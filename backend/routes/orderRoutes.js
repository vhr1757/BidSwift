import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import authorizeRoles from "../middlewares/roleMiddleware.js";

import {
    getAllOrders,
    getOrderByID,
    createOrder,
    updateOrder,
    deleteOrder,
    confirmOrder
} from "../controllers/orderController.js";

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    authorizeRoles("buyer", "seller", "admin"),
    getAllOrders
);

router.get(
    "/:id",
    authMiddleware,
    authorizeRoles("buyer", "admin"),
    getOrderByID
);

router.post(
    "/",
    authMiddleware,
    authorizeRoles("buyer"),
    createOrder
);

router.put(
    "/:id",
    authMiddleware,
    authorizeRoles("seller", "admin"),
    updateOrder
);

router.delete(
    "/:id",
    authMiddleware,
    authorizeRoles("buyer", "admin"),
    deleteOrder
);

router.post(
    "/:id/confirm",
    authMiddleware,
    authorizeRoles("seller"),
    confirmOrder
);

export default router;