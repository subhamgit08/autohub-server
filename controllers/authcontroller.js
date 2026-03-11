import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    connectionTimeout: 10000,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
    }
});

export const signUp = async (req, res) => {
    try {
        let { name, email, password, isDealer, dealerCode } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        isDealer = isDealer === true || isDealer === "true";

        if (isDealer) {
            if (!dealerCode || dealerCode.trim() === "") {
                return res.status(400).json({ message: "Dealer code is required for dealers" });
            }
        } else {
            dealerCode = "";
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            isDealer,
            dealerCode,
        });

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            isDealer: user.isDealer,
            token,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error(error);
    }
};

export const login = async (req, res) => {
    try {
        const { email, password, dealerCode } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }
        if (user.isDealer) {
            if (!dealerCode || dealerCode !== user.dealerCode) {
                return res.status(401).json({ message: "Invalid dealer code" });
            }
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
            message: "Login successful",
            user: { id: user._id, name: user.name, email: user.email, isDealer: user.isDealer }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        res.cookie("token", "", {
            httpOnly: true,
            expires: new Date(0),
        });

        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getMe = async (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const sendOtp = async (req, res) => {
    try {

        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await User.findOneAndUpdate(
            { email: email },
            {
                otp: otp,
                otpExpiresAt: Date.now() + 5 * 60 * 1000
            }
        );

        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "Email Verification OTP",
            text: `Your verification OTP is ${otp}. It will expire in 5 minutes.`
        });

        res.status(200).json({
            success: true,
            message: "OTP sent successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (!user.otp || user.otp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        if (user.otpExpiresAt < Date.now()) {
            return res.status(400).json({ success: false, message: "OTP has expired" });
        }

        user.isVerified = true;
        user.otp = "";
        user.otpExpiresAt = undefined;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Email verified successfully",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};