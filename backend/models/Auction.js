import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema(
    {
        item_ID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
            required: true
        },

        auctioneer_ID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        admin_ID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        highest_bidder_ID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        highest_bid_amount: {
            type: Number,
            default: null,
            min: 0
        },

        bid_increment: {
            type: Number,
            required: true,
            default: 1,
            min: 0.01
        },

        start_time: {
            type: Date,
            required: true
        },

        end_time: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: ["scheduled", "active", "completed", "cancelled"],
            default: "scheduled"
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model(
    "Auction",
    auctionSchema
);