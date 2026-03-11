import mongoose from "mongoose";

console.log("Email pass:",process.env.EMAIL_PASS);
console.log("MONGO URI:", process.env.MONGO_URI);


const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};
export default connectDB;