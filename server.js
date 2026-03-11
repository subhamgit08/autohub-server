import "dotenv/config";
import express from "express";
import connectDB from "./config/db.js";
import authroutes from "./routes/authroutes.js";
import carRoutes from "./routes/carRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
connectDB();

const app = express();
const PORT = 3000;


app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173", 
    credentials: true                
}));
app.use(express.json());

app.use("/api/auth",authroutes);
app.use("/api/cars",carRoutes);

app.get("/",(req,res)=>{
    res.send("Auth Server is running");
});


app.listen(PORT,()=>{
    console.log(`Server is running at http://localhost:${PORT}/`);
});
