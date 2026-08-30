import User from "../models/User.js";
import BuyerProfile from "../models/BuyerProfile.js";

const getAllBuyers = async (req, res) => {
    try {
        const buyers = await User.find({
            role: "buyer"
        });

        res.status(200).json(buyers);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch buyers"
        });
    }
};

const getBuyerByID = async (req, res) => {
    try {
        const buyer = await User.findOne({
            _id: req.params.id,
            role: "buyer"
        });

        if (!buyer) {
            return res.status(404).json({
                message: "Buyer not found"
            });
        }

        const profile = await BuyerProfile.findOne({
            user_ID: buyer._id
        });

        res.status(200).json({
            user: buyer,
            profile: profile
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch buyer"
        });
    }
};

const createBuyer = async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            email,
            password
        } = req.body;

        const buyer = await User.create({
            first_name,
            last_name,
            email,
            password,
            role: "buyer"
        });

        const buyerProfile = await BuyerProfile.create({
            user_ID: buyer._id
        });

        res.status(201).json({
            user: buyer,
            profile: buyerProfile
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to create buyer"
        });
    }
};

const updateBuyer = async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            email,
            password,
            wallet_ID
        } = req.body;

        const buyer = await User.findOneAndUpdate(
            {
                _id: req.params.id,
                role: "buyer"
            },
            {
                first_name,
                last_name,
                email,
                password
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!buyer) {
            return res.status(404).json({
                message: "Buyer not found"
            });
        }

        if (wallet_ID !== undefined) {
            await BuyerProfile.findOneAndUpdate(
                {
                    user_ID: buyer._id
                },
                {
                    wallet_ID
                },
                {
                    new: true,
                    runValidators: true
                }
            );
        }

        const profile = await BuyerProfile.findOne({
            user_ID: buyer._id
        });

        res.status(200).json({
            user: buyer,
            profile: profile
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update buyer"
        });
    }
};

const deleteBuyer = async (req, res) => {
    try {
        const buyer = await User.findOneAndDelete({
            _id: req.params.id,
            role: "buyer"
        });

        if (!buyer) {
            return res.status(404).json({
                message: "Buyer not found"
            });
        }

        await BuyerProfile.findOneAndDelete({
            user_ID: buyer._id
        });

        res.status(200).json({
            message: "Buyer deleted successfully"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to delete buyer"
        });
    }
};

export {
    getAllBuyers,
    getBuyerByID,
    createBuyer,
    updateBuyer,
    deleteBuyer
};