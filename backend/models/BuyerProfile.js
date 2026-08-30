import mongoose from "mongoose";

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

export default mongoose.model(
    "BuyerProfile",
    buyerProfileSchema
);