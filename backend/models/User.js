import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        first_name: {
            type: String,
            required: true,
            trim: true
        },

        last_name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            required: true,
            enum: ["buyer", "seller", "auctioneer", "admin"]
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model(
    "User",
    userSchema
);