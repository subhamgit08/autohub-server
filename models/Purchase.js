import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
{
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Car",
        required: true
    },

    dealer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
},
{ timestamps: true }
);

export default mongoose.model("Purchase", purchaseSchema);