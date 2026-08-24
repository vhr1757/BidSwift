const User = require("../models/User");
const SellerProfile = require("../models/SellerProfile");

const getAllSellers = async (req, res) => {
    try {
        const sellers = await User.find({
            role: "seller"
        });

        res.status(200).json(sellers);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch sellers"
        });
    }
};

const getSellerByID = async (req, res) => {
    try {
        const seller = await User.findOne({
            _id: req.params.id,
            role: "seller"
        });

        if (!seller) {
            return res.status(404).json({
                message: "Seller not found"
            });
        }

        const profile = await SellerProfile.findOne({
            user_ID: seller._id
        });

        res.status(200).json({
            user: seller,
            profile: profile
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch seller"
        });
    }
};

const createSeller = async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            email,
            password,
            seller_rating
        } = req.body;

        const seller = await User.create({
            first_name,
            last_name,
            email,
            password,
            role: "seller"
        });

        const sellerProfile = await SellerProfile.create({
            user_ID: seller._id,
            seller_rating: seller_rating ?? 0
        });

        res.status(201).json({
            user: seller,
            profile: sellerProfile
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to create seller"
        });
    }
};

const updateSeller = async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            email,
            password,
            seller_rating
        } = req.body;

        const seller = await User.findOneAndUpdate(
            {
                _id: req.params.id,
                role: "seller"
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

        if (!seller) {
            return res.status(404).json({
                message: "Seller not found"
            });
        }

        if (seller_rating !== undefined) {
            await SellerProfile.findOneAndUpdate(
                {
                    user_ID: seller._id
                },
                {
                    seller_rating
                },
                {
                    new: true,
                    runValidators: true
                }
            );
        }

        const profile = await SellerProfile.findOne({
            user_ID: seller._id
        });

        res.status(200).json({
            user: seller,
            profile: profile
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update seller"
        });
    }
};

const deleteSeller = async (req, res) => {
    try {
        const seller = await User.findOneAndDelete({
            _id: req.params.id,
            role: "seller"
        });

        if (!seller) {
            return res.status(404).json({
                message: "Seller not found"
            });
        }

        await SellerProfile.findOneAndDelete({
            user_ID: seller._id
        });

        res.status(200).json({
            message: "Seller deleted successfully"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to delete seller"
        });
    }
};

module.exports = {
    getAllSellers,
    getSellerByID,
    createSeller,
    updateSeller,
    deleteSeller
};