import Wallet from "../models/Wallet.js";

const getMyWallet = async (req, res) => {
    try {
        let wallet = await Wallet.findOne({
            buyer_ID: req.user.userId
        }).populate("buyer_ID", "-password");

        if (!wallet) {
            wallet = await Wallet.create({
                buyer_ID: req.user.userId
            });
        }

        res.status(200).json(wallet);
    }
    catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch wallet"
        });
    }
};

const deposit = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                message: "Amount must be greater than 0"
            });
        }

        let wallet = await Wallet.findOne({
            buyer_ID: req.user.userId
        });

        if (!wallet) {
            wallet = await Wallet.create({
                buyer_ID: req.user.userId
            });
        }

        wallet.balance += amount;

        wallet.transaction_history.push({
            type: "deposit",
            amount
        });

        await wallet.save();

        res.status(200).json({
            message: "Amount deposited successfully",
            wallet
        });
    }
    catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to deposit amount"
        });
    }
};

const withdraw = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                message: "Amount must be greater than 0"
            });
        }

        const wallet = await Wallet.findOne({
            buyer_ID: req.user.userId
        });

        if (!wallet) {
            return res.status(404).json({
                message: "Wallet not found"
            });
        }

        const availableBalance =
            wallet.balance - wallet.frozen_amount;

        if (amount > availableBalance) {
            return res.status(400).json({
                message: "Insufficient available balance"
            });
        }

        wallet.balance -= amount;

        wallet.transaction_history.push({
            type: "withdraw",
            amount
        });

        await wallet.save();

        res.status(200).json({
            message: "Amount withdrawn successfully",
            wallet
        });
    }
    catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to withdraw amount"
        });
    }
};

const freezeAmount = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                message: "Amount must be greater than 0"
            });
        }

        const wallet = await Wallet.findOne({
            buyer_ID: req.user.userId
        });

        if (!wallet) {
            return res.status(404).json({
                message: "Wallet not found"
            });
        }

        const availableBalance =
            wallet.balance - wallet.frozen_amount;

        if (amount > availableBalance) {
            return res.status(400).json({
                message: "Insufficient available balance"
            });
        }

        wallet.frozen_amount += amount;

        wallet.transaction_history.push({
            type: "freeze",
            amount
        });

        await wallet.save();

        res.status(200).json({
            message: "Amount frozen successfully",
            wallet
        });
    }
    catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to freeze amount"
        });
    }
};

const unfreezeAmount = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                message: "Amount must be greater than 0"
            });
        }

        const wallet = await Wallet.findOne({
            buyer_ID: req.user.userId
        });

        if (!wallet) {
            return res.status(404).json({
                message: "Wallet not found"
            });
        }

        if (amount > wallet.frozen_amount) {
            return res.status(400).json({
                message: "Amount exceeds frozen balance"
            });
        }

        wallet.frozen_amount -= amount;

        wallet.transaction_history.push({
            type: "unfreeze",
            amount
        });

        await wallet.save();

        res.status(200).json({
            message: "Amount unfrozen successfully",
            wallet
        });
    }
    catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to unfreeze amount"
        });
    }
};

export {
    getMyWallet,
    deposit,
    withdraw,
    freezeAmount,
    unfreezeAmount
};