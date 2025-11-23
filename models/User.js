import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/,
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
});
