import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
    {
        order_ID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            unique: true
        },

        total_amount: {
            type: Number,
            required: true,
            min: 0
        },

        tax: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },

        final_amount: {
            type: Number,
            required: true,
            min: 0
        },

        payment_status: {
            type: String,
            enum: ["pending", "paid", "failed", "refunded"],
            default: "pending"
        },

        generated_at: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Bill", billSchema);