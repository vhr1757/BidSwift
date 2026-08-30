import express from "express";

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

router.post("/", createItem);

router.put("/:id", updateItem);

router.delete("/:id", deleteItem);

export default router;