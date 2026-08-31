import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import authorizeRoles from "../middlewares/roleMiddleware.js";

import {
    getAllItems,
    getItemByID,
    createItem,
    updateItem,
    deleteItem
} from "../controllers/itemController.js";

const router = express.Router();

router.get("/", getAllItems);

router.get("/:id", getItemByID);

router.post(
    "/",
    authMiddleware,
    authorizeRoles("seller"),
    createItem
);

router.put(
    "/:id",
    authMiddleware,
    authorizeRoles("seller", "admin"),
    updateItem
);

router.delete(
    "/:id",
    authMiddleware,
    authorizeRoles("seller", "admin"),
    deleteItem
);

export default router;