import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
    {
        buyer_ID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        balance: {
            type: Number,
            required: true,
            default: 0,
            min: 0
        },

        frozen_amount: {
            type: Number,
            required: true,
            default: 0,
            min: 0
        },

        transaction_history: [
            {
                type: {
                    type: String,
                    enum: ["deposit", "withdraw", "freeze", "unfreeze", "payment"],
                    required: true
                },

                amount: {
                    type: Number,
                    required: true,
                    min: 0
                },

                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Wallet", walletSchema);