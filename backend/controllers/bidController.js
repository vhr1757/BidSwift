import Bid from "../models/Bid.js";
import Auction from "../models/Auction.js";

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
    try {
        const {
            auction_ID,
            amount
        } = req.body;

        const auction = await Auction.findById(auction_ID);

        if (!auction) {
            return res.status(404).json({
                message: "Auction not found"
            });
        }

        if (auction.status !== "active") {
            return res.status(400).json({
                message: "Auction is not active"
            });
        }

        if (new Date() < auction.start_time) {
            return res.status(400).json({
                message: "Auction has not started"
            });
        }

        if (new Date() > auction.end_time) {
            return res.status(400).json({
                message: "Auction has ended"
            });
        }

        const previousBid = await Bid.findOne({
            auction_ID
        }).sort({
            amount: -1
        });

        if (previousBid && amount <= previousBid.amount) {
            return res.status(400).json({
                message: "Bid must be higher than the current highest bid"
            });
        }

        const bid = await Bid.create({
            auction_ID,
            bidder_ID: req.user.userId,
            amount
        });

        auction.highest_bidder_ID = req.user.userId;

        await auction.save();

        res.status(201).json({
            bid
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to create bid"
        });
    }
};

const updateBid = async (req, res) => {
    try {
        const bid = await Bid.findById(
            req.params.id
        );

        if (!bid) {
            return res.status(404).json({
                message: "Bid not found"
            });
        }

        if (
            bid.bidder_ID.toString() !== req.user.userId
        ) {
            return res.status(403).json({
                message: "You are not allowed to modify this bid"
            });
        }

        const {
            amount
        } = req.body;

        bid.amount = amount;

        await bid.save();

        res.status(200).json(bid);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update bid"
        });
    }
};

const deleteBid = async (req, res) => {
    try {
        const bid = await Bid.findById(
            req.params.id
        );

        if (!bid) {
            return res.status(404).json({
                message: "Bid not found"
            });
        }

        if (
            bid.bidder_ID.toString() !== req.user.userId &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                message: "You are not allowed to delete this bid"
            });
        }

        await bid.deleteOne();

        res.status(200).json({
            message: "Bid deleted successfully"
        });
    }
    catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to delete bid"
        });
    }
}

export {
    getAllBids,
    getBidByID,
    createBid,
    updateBid,
    deleteBid
};