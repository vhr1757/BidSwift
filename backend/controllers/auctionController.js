import mongoose from "mongoose";
import Wallet from "../models/Wallet.js";
import runTransactionWithRetry from "../utils/transactionRetry.js";
import Auction from "../models/Auction.js";
import Item from "../models/Item.js";
import redisClient from "../config/redis.js";
import { emitAuctionStatusUpdate } from "../utils/socketEvents.js";

const getAllAuctions = async (req, res) => {
    try {
        const auctions = await Auction.find()
            .populate("item_ID");

        res.status(200).json(auctions);
    }
    catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch auctions"
        });
    }
}

const getAuctionByID = async (req, res) => {
    try {
        const auctionId = req.params.id;

        let cachedAuction = null;

        try {
            cachedAuction = await redisClient.get(
                `auction:${auctionId}`
            );
        }
        catch (redisError) {
            console.error(
                "Redis unavailable, using MongoDB:",
                redisError.message
            );
        }

        if (cachedAuction) {
            console.log("Redis cache HIT");

            return res.status(200).json(
                JSON.parse(cachedAuction)
            );
        }

        console.log("Redis cache MISS");

        const auction = await Auction.findById(
            auctionId
        ).populate("item_ID");

        if (!auction) {
            return res.status(404).json({
                message: "Auction not found"
            });
        }

        try {
            await redisClient.set(
                `auction:${auctionId}`,
                JSON.stringify(auction),
                {
                    EX: 30
                }
            );
        }
        catch (redisError) {
            console.error(
                "Failed to cache auction:",
                redisError.message
            );
        }

        res.status(200).json(auction);
    }
    catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch auction"
        });
    }
};

const createAuction = async (req, res) => {
    try {
        const {
            item_ID,
            start_time,
            end_time,
            bid_increment
        } = req.body;

        if (!item_ID || !start_time || !end_time) {
            return res.status(400).json({
                message: "Item ID, start time and end time are required"
            });
        }

        if (
            bid_increment !== undefined &&
            (
                typeof bid_increment !== "number" ||
                !Number.isFinite(bid_increment) ||
                bid_increment <= 0
            )
        ) {
            return res.status(400).json({
                message: "Bid increment must be a valid number greater than 0"
            });
        }

        const startDate = new Date(start_time);
        const endDate = new Date(end_time);

        if (
            Number.isNaN(startDate.getTime()) ||
            Number.isNaN(endDate.getTime())
        ) {
            return res.status(400).json({
                message: "Invalid start or end time"
            });
        }

        if (startDate >= endDate) {
            return res.status(400).json({
                message: "End time must be after start time"
            });
        }

        const item = await Item.findById(item_ID);

        if (!item) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        const auction = await Auction.create({
            item_ID,
            auctioneer_ID: req.user.userId,
            start_time: startDate,
            end_time: endDate,
            bid_increment: bid_increment ?? 1,
            highest_bidder_ID: null,
            highest_bid_amount: null,
            status: "scheduled"
        });

        res.status(201).json({
            message: "Auction created successfully",
            auction
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to create auction"
        });
    }
};

const updateAuction = async (req, res) => {
    try {
        const auction = await Auction.findById(
            req.params.id
        );

        if (!auction) {
            return res.status(404).json({
                message: "Auction not found"
            });
        }

        if (
            auction.auctioneer_ID.toString() !== req.user.userId &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                message: "You are not allowed to modify this auction"
            });
        }

        const {
            start_time,
            end_time,
            status,
            bid_increment
        } = req.body;

        if (
            bid_increment !== undefined &&
            (
                typeof bid_increment !== "number" ||
                !Number.isFinite(bid_increment) ||
                bid_increment <= 0
            )
        ) {
            return res.status(400).json({
                message: "Bid increment must be a valid number greater than 0"
            });
        }

        if (
            bid_increment !== undefined &&
            auction.status !== "scheduled"
        ) {
            return res.status(400).json({
                message: "Bid increment can only be changed for scheduled auctions"
            });
        }

        if (start_time !== undefined) {
            const startDate = new Date(start_time);

            if (Number.isNaN(startDate.getTime())) {
                return res.status(400).json({
                    message: "Invalid start time"
                });
            }

            auction.start_time = startDate;
        }

        if (end_time !== undefined) {
            const endDate = new Date(end_time);

            if (Number.isNaN(endDate.getTime())) {
                return res.status(400).json({
                    message: "Invalid end time"
                });
            }

            auction.end_time = endDate;
        }

        if (auction.start_time >= auction.end_time) {
            return res.status(400).json({
                message: "End time must be after start time"
            });
        }

        if (bid_increment !== undefined) {
            auction.bid_increment = bid_increment;
        }

        if (status !== undefined) {
            auction.status = status;
        }

        await auction.save();

        res.status(200).json({
            message: "Auction updated successfully",
            auction
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update auction"
        });
    }
};

const deleteAuction = async (req, res) => {
    try {
        const auction = await Auction.findById(
            req.params.id
        );

        if (!auction) {
            return res.status(404).json({
                message: "Auction not found"
            });
        }

        if (
            auction.auctioneer_ID.toString() !== req.user.userId &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                message: "You are not allowed to delete this auction"
            });
        }

        await auction.deleteOne();

        res.status(200).json({
            message: "Auction deleted successfully"
        });
    }
    catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to delete auction"
        });
    }
}

const completeAuction = async (req, res) => {

    const session = await mongoose.startSession();


    try {

        let completedAuction;
        let createdOrder = null;


        await runTransactionWithRetry(
            session,

            async () => {

                const auction = await Auction.findById(
                    req.params.id
                )
                    .populate("item_ID")
                    .session(session);


                if (!auction) {
                    throw new Error("AUCTION_NOT_FOUND");
                }

                if (auction.status === "completed") {
                    throw new Error("AUCTION_ALREADY_COMPLETED");
                }

                if (auction.status !== "active") {
                    throw new Error("AUCTION_NOT_ACTIVE");
                }

                const now = new Date();

                if (now < auction.end_time) {
                    throw new Error("AUCTION_NOT_ENDED");
                }

                if (!auction.item_ID) {
                    throw new Error("ITEM_NOT_FOUND");
                }

                // If there is no highest bidder or highest bid amount, we can mark the auction as completed without creating an order or modifying any wallets.
                if (
                    auction.highest_bidder_ID === null ||
                    auction.highest_bid_amount === null
                ) {

                    auction.status = "completed";


                    await auction.save({
                        session
                    });


                    completedAuction = auction;

                    return;
                }

                const winnerWallet = await Wallet.findOne({
                        buyer_ID: auction.highest_bidder_ID
                    }).session(session);

                if (!winnerWallet) {
                    throw new Error(
                        "WINNER_WALLET_NOT_FOUND"
                    );
                }

                const winningAmount = auction.highest_bid_amount;

                if (
                    winnerWallet.frozen_amount < winningAmount
                ) {
                    throw new Error(
                        "WINNER_FREEZE_INCONSISTENT"
                    );
                }

                if (
                    winnerWallet.balance < winningAmount
                ) {
                    throw new Error(
                        "WINNER_INSUFFICIENT_BALANCE"
                    );
                }

                winnerWallet.balance -= winningAmount;
                winnerWallet.frozen_amount -= winningAmount;

                winnerWallet.transaction_history.push({
                    type: "payment",
                    amount: winningAmount
                });

                await winnerWallet.save({
                    session
                });

                createdOrder = await Order.create(
                    [
                        {
                            buyer_ID: auction.highest_bidder_ID,
                            item_ID: auction.item_ID._id,
                            total_amount: winningAmount,
                            status: "confirmed"
                        }
                    ],
                    {
                        session
                    }
                );

                createdOrder = createdOrder[0];

                auction.item_ID.status = "sold";

                await auction.item_ID.save({
                    session
                });

                auction.status = "completed";

                await auction.save({
                    session
                });

                completedAuction = auction;
            },
            3
        );

        try {

            await redisClient.del(
                `auction:${auctionId}`
            );

        }
        catch (redisError) {

            console.error(
                "Failed to invalidate auction cache:",
                redisError.message
            );

        }

        emitAuctionStatusUpdate(
            auctionId,
            "completed"
        );

        return res.status(200).json({
            message: "Auction completed and winner settlement successful",
            auction: completedAuction,
            order: createdOrder
        });

    } catch (error) {

        console.error(error);

        if (error.message === "AUCTION_NOT_FOUND") {
            return res.status(404).json({
                message: "Auction not found"
            });
        }

        if (
            error.message === "AUCTION_ALREADY_COMPLETED"
        ) {
            return res.status(400).json({
                message: "Auction has already been completed"
            });
        }

        if (
            error.message === "AUCTION_NOT_ACTIVE"
        ) {
            return res.status(400).json({
                message: "Auction is not active"
            });
        }

        if (
            error.message === "AUCTION_NOT_ENDED"
        ) {
            return res.status(400).json({
                message:
                    "Auction cannot be completed before its end time"
            });
        }

        if (
            error.message === "ITEM_NOT_FOUND"
        ) {
            return res.status(404).json({
                message:
                    "Item associated with this auction not found"
            });
        }

        if (
            error.message === "WINNER_WALLET_NOT_FOUND"
        ) {
            return res.status(404).json({
                message:
                    "Winner wallet not found"
            });
        }

        if (
            error.message === "WINNER_FREEZE_INCONSISTENT"
        ) {
            return res.status(500).json({
                message:
                    "Winner wallet reservation is inconsistent"
            });
        }

        if (
            error.message === "WINNER_INSUFFICIENT_BALANCE"
        ) {
            return res.status(400).json({
                message:
                    "Winner does not have enough wallet balance to complete payment"
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
                    "Auction settlement could not be completed because the auction changed. Please try again."
            });
        }

        return res.status(500).json({
            message:
                "Failed to complete auction"
        });
    }

    finally {
        await session.endSession();
    }
};

export {
    getAllAuctions,
    getAuctionByID,
    createAuction,
    updateAuction,
    deleteAuction,
    completeAuction
};