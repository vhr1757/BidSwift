const mongoose = require("mongoose");

const sellerProfileSchema = new mongoose.Schema(
    {
        user_ID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        seller_rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "SellerProfile",
    sellerProfileSchema
);