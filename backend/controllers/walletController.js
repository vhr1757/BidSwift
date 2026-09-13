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

        if (
            typeof amount !== "number" ||
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            return res.status(400).json({
                message: "Amount must be a valid number greater than 0"
            });
        }

        let wallet = await Wallet.findOne({
            buyer_ID: req.user.userId
        });

        if (!wallet) {

            wallet = await Wallet.create({
                buyer_ID: req.user.userId,
                balance: amount,
                frozen_amount: 0,

                transaction_history: [
                    {
                        type: "deposit",
                        amount
                    }
                ]
            });

        }

        else {

            wallet.balance += amount;

            wallet.transaction_history.push({
                type: "deposit",
                amount
            });

            await wallet.save();

        }

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

        if (
            typeof amount !== "number" ||
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            return res.status(400).json({
                message: "Amount must be a valid number greater than 0"
            });
        }

        const wallet = await Wallet.findOneAndUpdate(
            {
                buyer_ID: req.user.userId,

                $expr: {
                    $gte: [
                        {
                            $subtract: [
                                "$balance",
                                "$frozen_amount"
                            ]
                        },
                        amount
                    ]
                }
            },
            {
                $inc: {
                    balance: -amount
                },

                $push: {
                    transaction_history: {
                        type: "withdraw",
                        amount
                    }
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!wallet) {
            const existingWallet = await Wallet.findOne({
                buyer_ID: req.user.userId
            });

            if (!existingWallet) {
                return res.status(404).json({
                    message: "Wallet not found"
                });
            }

            return res.status(400).json({
                message: "Insufficient available balance"
            });
        }

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

        if (
            typeof amount !== "number" ||
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            return res.status(400).json({
                message: "Amount must be a valid number greater than 0"
            });
        }

        const wallet = await Wallet.findOneAndUpdate(
            {
                buyer_ID: req.user.userId,

                $expr: {
                    $gte: [
                        {
                            $subtract: [
                                "$balance",
                                "$frozen_amount"
                            ]
                        },
                        amount
                    ]
                }
            },
            {
                $inc: {
                    frozen_amount: amount
                },

                $push: {
                    transaction_history: {
                        type: "freeze",
                        amount
                    }
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!wallet) {
            const existingWallet = await Wallet.findOne({
                buyer_ID: req.user.userId
            });

            if (!existingWallet) {
                return res.status(404).json({
                    message: "Wallet not found"
                });
            }

            return res.status(400).json({
                message: "Insufficient available balance"
            });
        }

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

        if (
            typeof amount !== "number" ||
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            return res.status(400).json({
                message: "Amount must be a valid number greater than 0"
            });
        }

        const wallet = await Wallet.findOneAndUpdate(
            {
                buyer_ID: req.user.userId,

                frozen_amount: {
                    $gte: amount
                }
            },
            {
                $inc: {
                    frozen_amount: -amount
                },

                $push: {
                    transaction_history: {
                        type: "unfreeze",
                        amount
                    }
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!wallet) {
            const existingWallet = await Wallet.findOne({
                buyer_ID: req.user.userId
            });

            if (!existingWallet) {
                return res.status(404).json({
                    message: "Wallet not found"
                });
            }

            return res.status(400).json({
                message: "Amount exceeds frozen balance"
            });
        }

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