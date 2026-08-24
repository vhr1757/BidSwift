const express = require("express");

const {
    getAllAdmins,
    getAdminByID,
    createAdmin,
    updateAdmin,
    deleteAdmin
} = require("../controllers/adminController");

const router = express.Router();

router.get("/", getAllAdmins);

router.get("/:id", getAdminByID);

router.post("/", createAdmin);

router.put("/:id", updateAdmin);

router.delete("/:id", deleteAdmin);

module.exports = router;