import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
    {
        brand: {
            type: String,
            required: true,
            trim: true,
        },

        model: {
            type: String,
            required: true,
            trim: true,
        },

        year: {
            type: Number,
            required: true,
            min: 1900,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },

        image: {
            type: String,
        },

        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Car", carSchema);