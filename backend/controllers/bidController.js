import mongoose from "mongoose";
import Bid from "../models/Bid.js";
import Auction from "../models/Auction.js";
import Wallet from "../models/Wallet.js";
import runTransactionWithRetry from "../utils/transactionRetry.js";

const getAllBids = async (req, res) => {
    try {
        const bids = await Bid.find()
            .populate("bidder_ID", "-password")
            .populate("auction_ID");

        res.status(200).json(bids);
    }
    catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch bids"
        });
    }
}

const getBidByID = async (req, res) => {
    try {
        const bid = await Bid.findById(
            req.params.id
        )
            .populate("bidder_ID", "-password")
            .populate("auction_ID");

        if (!bid) {
            return res.status(404).json({
                message: "Bid not found"
            });
        }

        res.status(200).json(bid);
    }
    catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch bid"
        });
    }
}

const createBid = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const {
            auction_ID,
            amount
        } = req.body;

        if (!auction_ID) {
            return res.status(400).json({
                message: "Auction ID is required"
            });
        }

        if (
            typeof amount !== "number" ||
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            return res.status(400).json({
                message: "Bid amount must be a valid number greater than 0"
            });
        }

        let createdBid;

        await runTransactionWithRetry(session, 
            async () => {

                const auction = await Auction.findById(auction_ID)
                    .populate("item_ID")
                    .session(session);

                if (!auction) {
                    throw new Error("AUCTION_NOT_FOUND");
                }

                if (!auction.item_ID) {
                    throw new Error("ITEM_NOT_FOUND");
                }

                if (
                    auction.item_ID.seller_ID.toString() ===
                    req.user.userId
                ) {
                    throw new Error("SELLER_OWN_ITEM");
                }

                if (auction.status !== "active") {
                    throw new Error("AUCTION_NOT_ACTIVE");
                }

                const now = new Date();

                if (now < auction.start_time) {
                    throw new Error("AUCTION_NOT_STARTED");
                }

                if (now > auction.end_time) {
                    throw new Error("AUCTION_ENDED");
                }

                let minimumBid;

                if (auction.highest_bid_amount === null) {
                    minimumBid = auction.item_ID.start_price;
                } else {
                    minimumBid =
                        auction.highest_bid_amount +
                        auction.bid_increment;
                }

                if (amount < minimumBid) {
                    throw new Error(
                        `MINIMUM_BID:${minimumBid}`
                    );
                }

                const bidderWallet = await Wallet.findOne({ 
                    buyer_ID: req.user.userId
                }).session(session);

                if (!bidderWallet) { 
                    throw new Error("WALLET_NOT_FOUND"); 
                }

                const availableBalance = bidderWallet.balance - bidderWallet.frozen_amount;

                let amountToFreeze;

                if (auction.highest_bidder_ID === null) {
                    amountToFreeze = amount;
                }
                else if (auction.highest_bidder_ID.toString() === req.user.userId) { 
                    amountToFreeze = amount - auction.highest_bid_amount;
                    if (amountToFreeze <= 0) 
                    { 
                        throw new Error("INVALID_FREEZE_AMOUNT"); 
                    } 
                }
                else { 
                    amountToFreeze = amount; 
                }

                if (availableBalance < amountToFreeze) { 
                    throw new Error("INSUFFICIENT_BALANCE"); 
                }

                if(
                    auction.highest_bidder_ID !== null &&
                    auction.highest_bidder_ID.toString() !== req.user.userId
                ){
                    const previousBidderWallet = await Wallet.findOne({
                        buyer_ID: auction.highest_bidder_ID
                    }).session(session);

                    if(!previousBidderWallet) {
                        throw new Error(
                            "PREVIOUS_BIDDER_WALLET_NOT_FOUND"
                        );
                    }

                    const previousBidAmount = auction.highest_bid_amount;

                    if(previousBidderWallet.frozen_amount < previousBidAmount) {
                        throw new Error(
                            "PREVIOUS_BIDDER_FREEZE_INCONSISTENT"
                        );
                    }

                    previousBidderWallet.frozen_amount -= previousBidAmount;

                    previousBidderWallet.transaction_history.push({
                        type: "unfreeze",
                        amount: previousBidAmount
                    });

                    await previousBidderWallet.save({
                        session
                    });
                }

                bidderWallet.frozen_amount += amountToFreeze;

                bidderWallet.transaction_history.push({
                    type: "freeze",
                    amount: amountToFreeze
                });

                await bidderWallet.save({
                    session
                });

                const bid = await Bid.create(
                    [
                        {
                            auction_ID,
                            bidder_ID: req.user.userId,
                            amount
                        }
                    ],
                    {
                        session
                    }
                );

                createdBid = bid[0];

                auction.highest_bidder_ID =
                    req.user.userId;

                auction.highest_bid_amount =
                    amount;

                await auction.save({
                    session
                });
            },
            3
        );

        res.status(201).json({
            message: "Bid placed successfully",
            bid: createdBid
        });

    } catch (error) {
        console.error(error);

        if (error.message === "AUCTION_NOT_FOUND") {
            return res.status(404).json({
                message: "Auction not found"
            });
        }

        if (error.message === "ITEM_NOT_FOUND") {
            return res.status(404).json({
                message: "Item associated with this auction not found"
            });
        }

        if (error.message === "SELLER_OWN_ITEM") {
            return res.status(403).json({
                message: "Seller cannot bid on their own item"
            });
        }

        if (error.message === "AUCTION_NOT_ACTIVE") {
            return res.status(400).json({
                message: "Auction is not active"
            });
        }

        if (error.message === "AUCTION_NOT_STARTED") {
            return res.status(400).json({
                message: "Auction has not started"
            });
        }

        if (error.message === "AUCTION_ENDED") {
            return res.status(400).json({
                message: "Auction has ended"
            });
        }

        if (error.message === "WALLET_NOT_FOUND") {
            return res.status(404).json({
                message: "Wallet not found. Please create or fund your wallet first"
            });
        }

        if (error.message === "INSUFFICIENT_BALANCE") {
            return res.status(400).json({
                message: "Insufficient available wallet balance for this bid"
            });
        }

        if (error.message === "INVALID_FREEZE_AMOUNT") {
            return res.status(400).json({
                message: "Invalid amount to freeze for this bid"
            });
        }

        if (error.message === "PREVIOUS_BIDDER_WALLET_NOT_FOUND") {
            return res.status(500).json({
                message: "Previous bidder wallet was not found"
            });
        }

        if (error.message === "PREVIOUS_BIDDER_FREEZE_INCONSISTENT") {
            return res.status(500).json({
                message: "Wallet reservation data is inconsistent"
            });
        }

        if (error.message.startsWith("MINIMUM_BID:")) {
            const minimumBid =
                error.message.split(":")[1];

            return res.status(400).json({
                message:
                    `Bid must be at least ${minimumBid}`
            });
        }

        if (
            error.hasErrorLabel &&
            (
                error.hasErrorLabel(
                    "TransientTransactionError"
                ) ||
                error.hasErrorLabel(
                    "UnknownTransactionCommitResult"
                )
            )
        ) {
            return res.status(409).json({
                message:
                    "Bid could not be processed because the auction changed. Please try again."
            });
        }

        res.status(500).json({
            message: "Failed to create bid"
        });

    } finally {
        await session.endSession();
    }
};

export {
    getAllBids,
    getBidByID,
    createBid
};