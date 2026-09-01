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
            end_time
        } = req.body;

        const item = await Item.findById(item_ID);

        if (!item) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        const auction = await Auction.create({
            item_ID,
            auctioneer_ID: req.user.userId,
            start_time,
            end_time,
            status: "scheduled"
        });

        res.status(201).json({
            auction: auction
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
            status
        } = req.body;

        auction.start_time = start_time ?? auction.start_time;
        auction.end_time = end_time ?? auction.end_time;
        auction.status = status ?? auction.status;

        await auction.save();

        res.status(200).json(auction);

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