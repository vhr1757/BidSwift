import Auction from "../models/Auction.js";
import Item from "../models/Item.js";

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
        const auction = await Auction.findById(
            req.params.id
        ).populate("item_ID");

        if (!auction) {
            return res.status(404).json({
                message: "Auction not found"
            });
        }

        res.status(200).json(auction);
    }
    catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch auction"
        });
    }
}

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

export {
    getAllAuctions,
    getAuctionByID,
    createAuction,
    updateAuction,
    deleteAuction
};