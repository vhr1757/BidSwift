import express from "express";

import {
    getAllAdmins,
    getAdminByID,
    createAdmin,
    updateAdmin,
    deleteAdmin
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/", getAllAdmins);

router.get("/:id", getAdminByID);

router.post("/", createAdmin);

router.put("/:id", updateAdmin);

router.delete("/:id", deleteAdmin);

export default router;