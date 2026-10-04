import mongoose from "mongoose";
import Wallet from "../models/Wallet.js";
import Order from "../models/Order.js";
import runTransactionWithRetry from "../utils/transactionRetry.js";
import Auction from "../models/Auction.js";
import Item from "../models/Item.js";
import redisClient from "../config/redis.js";
import {
  emitAuctionStatusUpdate,
  emitAuctionUpdated,
} from "../utils/socketEvents.js";

const getAllAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find().populate("item_ID");

    res.status(200).json(auctions);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch auctions",
    });
  }
};

const getAuctionByID = async (req, res) => {
  try {
    const auctionId = req.params.id;

    let cachedAuction = null;

    try {
      cachedAuction = await redisClient.get(`auction:${auctionId}`);
    } catch (redisError) {
      console.error("Redis unavailable, using MongoDB:", redisError.message);
    }

    if (cachedAuction) {
      console.log("Redis cache HIT");

      return res.status(200).json(JSON.parse(cachedAuction));
    }

    console.log("Redis cache MISS");

    const auction = await Auction.findById(auctionId).populate("item_ID");

    if (!auction) {
      return res.status(404).json({
        message: "Auction not found",
      });
    }

    if (auction.status === "scheduled" && new Date() >= auction.start_time) {
      auction.status = "active";

      await auction.save();

      console.log(`Auction ${auctionId} automatically activated`);
    }

    try {
      await redisClient.set(`auction:${auctionId}`, JSON.stringify(auction), {
        EX: 30,
      });
    } catch (redisError) {
      console.error("Failed to cache auction:", redisError.message);
    }

    res.status(200).json(auction);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch auction",
    });
  }
};

const createAuction = async (req, res) => {
  try {
    const { item_ID, start_time, end_time, bid_increment } = req.body;

    if (!item_ID || !start_time || !end_time) {
      return res.status(400).json({
        message: "Item ID, start time and end time are required",
      });
    }

    if (
      bid_increment !== undefined &&
      (typeof bid_increment !== "number" ||
        !Number.isFinite(bid_increment) ||
        bid_increment <= 0)
    ) {
      return res.status(400).json({
        message: "Bid increment must be a valid number greater than 0",
      });
    }

    const startDate = new Date(start_time);
    const endDate = new Date(end_time);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return res.status(400).json({
        message: "Invalid start or end time",
      });
    }

    if (startDate >= endDate) {
      return res.status(400).json({
        message: "End time must be after start time",
      });
    }

    const item = await Item.findById(item_ID);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
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
      status: "scheduled",
    });

    res.status(201).json({
      message: "Auction created successfully",
      auction,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create auction",
    });
  }
};

const updateAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({
        message: "Auction not found",
      });
    }

    if (
      auction.auctioneer_ID.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "You are not allowed to modify this auction",
      });
    }

    const { start_time, end_time, status, bid_increment } = req.body;

    if (
      bid_increment !== undefined &&
      (typeof bid_increment !== "number" ||
        !Number.isFinite(bid_increment) ||
        bid_increment <= 0)
    ) {
      return res.status(400).json({
        message: "Bid increment must be a valid number greater than 0",
      });
    }

    if (bid_increment !== undefined && auction.status !== "scheduled") {
      return res.status(400).json({
        message: "Bid increment can only be changed for scheduled auctions",
      });
    }

    if (start_time !== undefined) {
      const startDate = new Date(start_time);

      if (Number.isNaN(startDate.getTime())) {
        return res.status(400).json({
          message: "Invalid start time",
        });
      }

      auction.start_time = startDate;
    }

    if (end_time !== undefined) {
      const endDate = new Date(end_time);

      if (Number.isNaN(endDate.getTime())) {
        return res.status(400).json({
          message: "Invalid end time",
        });
      }

      auction.end_time = endDate;
    }

    if (auction.start_time >= auction.end_time) {
      return res.status(400).json({
        message: "End time must be after start time",
      });
    }

    if (bid_increment !== undefined) {
      auction.bid_increment = bid_increment;
    }

    if (status !== undefined) {
      auction.status = status;
    }

    await auction.save();

    emitAuctionUpdated(req.params.id, auction);

    res.status(200).json({
      message: "Auction updated successfully",
      auction,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update auction",
    });
  }
};

const deleteAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({
        message: "Auction not found",
      });
    }

    if (
      auction.auctioneer_ID.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "You are not allowed to delete this auction",
      });
    }

    await auction.deleteOne();

    res.status(200).json({
      message: "Auction deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete auction",
    });
  }
};

const activateAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({
        message: "Auction not found",
      });
    }

    if (auction.status !== "scheduled") {
      return res.status(200).json({
        message: "Auction is already active or has ended",
        auction,
      });
    }

    const now = new Date();

    if (now < auction.start_time) {
      return res.status(400).json({
        message: "Auction cannot be activated before its start time",
      });
    }

    auction.status = "active";

    await auction.save();

    try {
      await redisClient.del(`auction:${req.params.id}`);
    } catch (redisError) {
      console.error("Failed to invalidate auction cache:", redisError.message);
    }

    emitAuctionStatusUpdate(req.params.id, "active");

    return res.status(200).json({
      message: "Auction activated successfully",

      auction,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to activate auction",
    });
  }
};

const settleAuction = async (auctionId) => {
  const session = await mongoose.startSession();

  let completedAuction;
  let createdOrder = null;

  try {
    await runTransactionWithRetry(
      session,
      async () => {
        const auction = await Auction.findById(auctionId)
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

        if (
          auction.highest_bidder_ID === null ||
          auction.highest_bid_amount === null
        ) {
          auction.status = "completed";

          await auction.save({
            session,
          });

          completedAuction = auction;

          return;
        }

        const expiryHours = Number(
          process.env.ORDER_CONFIRMATION_EXPIRY_HOURS || 24,
        );

        const confirmationDeadline = new Date(
          Date.now() + expiryHours * 60 * 60 * 1000,
        );

        const existingOrder = await Order.findOne({
          item_ID: auction.item_ID._id,
          buyer_ID: auction.highest_bidder_ID,
          total_amount: auction.highest_bid_amount,
          status: "pending",
        }).session(session);

        if (existingOrder) {
          createdOrder = existingOrder;
        } else {
          const orders = await Order.create(
            [
              {
                buyer_ID: auction.highest_bidder_ID,

                item_ID: auction.item_ID._id,

                total_amount: auction.highest_bid_amount,

                confirmation_deadline: confirmationDeadline,

                status: "pending",
              },
            ],
            {
              session,
            },
          );

          createdOrder = orders[0];
        }

        auction.status = "completed";

        await auction.save({
          session,
        });

        completedAuction = auction;
      },
      3,
    );

    try {
      await redisClient.del(`auction:${auctionId}`);
    } catch (redisError) {
      console.error("Failed to invalidate auction cache:", redisError.message);
    }

    emitAuctionStatusUpdate(auctionId, "completed");

    return {
      auction: completedAuction,

      order: createdOrder,
    };
  } finally {
    await session.endSession();
  }
};

const completeAuction = async (req, res) => {
  try {
    const result = await settleAuction(req.params.id);

    return res.status(200).json({
      message: "Auction completed and pending order created",

      auction: result.auction,

      order: result.order,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "AUCTION_NOT_FOUND") {
      return res.status(404).json({
        message: "Auction not found",
      });
    }

    if (error.message === "AUCTION_ALREADY_COMPLETED") {
      return res.status(400).json({
        message: "Auction has already been completed",
      });
    }

    if (error.message === "AUCTION_NOT_ACTIVE") {
      return res.status(400).json({
        message: "Auction is not active",
      });
    }

    if (error.message === "AUCTION_NOT_ENDED") {
      return res.status(400).json({
        message: "Auction cannot be completed before its end time",
      });
    }

    if (error.message === "ITEM_NOT_FOUND") {
      return res.status(404).json({
        message: "Item associated with this auction not found",
      });
    }

    if (
      error.hasErrorLabel &&
      (error.hasErrorLabel("TransientTransactionError") ||
        error.hasErrorLabel("UnknownTransactionCommitResult"))
    ) {
      return res.status(409).json({
        message:
          "Auction settlement could not be completed because the auction changed. Please try again.",
      });
    }

    return res.status(500).json({
      message: "Failed to complete auction",
    });
  }
};

export {
  getAllAuctions,
  getAuctionByID,
  createAuction,
  updateAuction,
  deleteAuction,
  activateAuction,
  completeAuction,
};
