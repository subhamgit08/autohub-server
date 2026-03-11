import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    token: {
        type: String,
    },
    isDealer: {
        type: Boolean,
        default: false,
    },
    dealerCode: {
        type: String,
        default: "",
        required: function () {
            return this.isDealer === true;
        }
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    otp: {
        type: String,
        default: "",
    },
    otpExpiresAt: {
        type: Date
    },
    walletBalance: {
        type: Number,
        default: 100000000
    }
},
    { timestamps: true }
);

export default mongoose.model("User", userSchema);