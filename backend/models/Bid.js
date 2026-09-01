import mongoose from "mongoose";

const bidSchema = new mongoose.Schema(
    {
        auction_ID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auction",
            required: true
        },

        bidder_ID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Bid", bidSchema);