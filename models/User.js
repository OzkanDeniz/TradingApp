import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please add a valid email",
      ],
    },
    password: {
      type: String,
    },
    name: {
      type: String,
      maxlenght: 50,
      minlenght: 3,
    },
    login_pin: {
      type: String,
      maxlenght: 4,
      minlenght: 4,
    },
    phone_number: {
      type: String,
      match: [/^[0-9]{10}$/, "Please add a valid phone number"],
      unique: true,
      sparse: true,
    },
    date_of_birth: Date,
    biometricKey: String,
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    wrong_pin_attemps: {
      type: Number,
      default: 0,
    },
    blocked_until_ğin: {
      type: Date,
      default: null,
    },
    balance: {
      type: Number,
      default: 50000.0,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

export default User