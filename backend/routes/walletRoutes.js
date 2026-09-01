import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import authorizeRoles from "../middlewares/roleMiddleware.js";

import {
    getMyWallet,
    deposit,
    withdraw,
    freezeAmount,
    unfreezeAmount
} from "../controllers/walletController.js";

const router = express.Router();

router.get(
    "/me",
    authMiddleware,
    authorizeRoles("buyer"),
    getMyWallet
);

router.post(
    "/deposit",
    authMiddleware,
    authorizeRoles("buyer"),
    deposit
);

router.post(
    "/withdraw",
    authMiddleware,
    authorizeRoles("buyer"),
    withdraw
);

router.post(
    "/freeze",
    authMiddleware,
    authorizeRoles("buyer"),
    freezeAmount
);

router.post(
    "/unfreeze",
    authMiddleware,
    authorizeRoles("buyer"),
    unfreezeAmount
);

export default router;