const mongoose = require("mongoose");

const buyerProfileSchema = new mongoose.Schema(
    {
        user_ID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        wallet_ID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Wallet",
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "BuyerProfile",
    buyerProfileSchema
);