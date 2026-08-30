import User from "../models/User.js";

const getAllAuctioneers = async (req, res) => {
    try {
        const auctioneers = await User.find({
            role: "auctioneer"
        });

        res.status(200).json(auctioneers);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch auctioneers"
        });
    }
};

const getAuctioneerByID = async (req, res) => {
    try {
        const auctioneer = await User.findOne({
            _id: req.params.id,
            role: "auctioneer"
        });

        if (!auctioneer) {
            return res.status(404).json({
                message: "Auctioneer not found"
            });
        }

        res.status(200).json(auctioneer);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch auctioneer"
        });
    }
};

const createAuctioneer = async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            email,
            password
        } = req.body;

        const auctioneer = await User.create({
            first_name,
            last_name,
            email,
            password,
            role: "auctioneer"
        });

        res.status(201).json(auctioneer);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to create auctioneer"
        });
    }
};

const updateAuctioneer = async (req, res) => {
    try {
        const auctioneer = await User.findOneAndUpdate(
            {
                _id: req.params.id,
                role: "auctioneer"
            },
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!auctioneer) {
            return res.status(404).json({
                message: "Auctioneer not found"
            });
        }

        res.status(200).json(auctioneer);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update auctioneer"
        });
    }
};

const deleteAuctioneer = async (req, res) => {
    try {
        const auctioneer = await User.findOneAndDelete({
            _id: req.params.id,
            role: "auctioneer"
        });

        if (!auctioneer) {
            return res.status(404).json({
                message: "Auctioneer not found"
            });
        }

        res.status(200).json({
            message: "Auctioneer deleted successfully"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to delete auctioneer"
        });
    }
};

export {
    getAllAuctioneers,
    getAuctioneerByID,
    createAuctioneer,
    updateAuctioneer,
    deleteAuctioneer
};