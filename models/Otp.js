import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { mailSender } from "../utils/mailSender.js";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 5,
  },
  otp_type: {
    type: String,
    enum: ["phone", "email", "reset_password", "reset_pin"],
    required: true,
  },
});

otpSchema.pre("save", async function (next) {
    
});
