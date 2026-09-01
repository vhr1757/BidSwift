import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        buyer_ID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        item_ID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
            required: true
        },

        order_date: {
            type: Date,
            default: Date.now
        },

        total_amount: {
            type: Number,
            required: true,
            min: 0
        },

        status: {
            type: String,
            enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Order", orderSchema);