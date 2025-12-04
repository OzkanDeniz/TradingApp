import mongoose from "mongoose";
import bcrypt, { hash } from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  UnauthenticateadError,
  BadRequestError,
  NotFoundError,
} from "../errors/index.js";

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
    blocked_until_pin: {
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

UserSchema.pre("save", async function () {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

UserSchema.pre("save", async function () {
  if (this.isModified("login_pin")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.login_pin, salt);
  }
});

UserSchema.statics.updatePIN = async function (email, newPIN) {
  try {
    const user = await this.findOne({ email });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const isSamePIN = await bcrypt.compare(newPIN, user.login_pin);
    if (isSamePIN) {
      throw new BadRequestError("New PIN must be different from the old PIN");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPIN = await bcrypt.hash(newPIN, salt);

    await this.findOneAndUpdate(
      { email },
      { login_pin: hashedPIN, wrong_pin_attemps: 0, blocked_until_pin: null }
    );

    return { success: true, message: "PIN uptadet successfully" };
  } catch (error) {
    throw error;
  }
};

UserSchema.statics.updatePassword = async function (email, newPassword) {
  try {
    const user = await user.findOne({ email });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestError(
        "New password must be different from the old password"
      );
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await User.findOneAndUpdate(
      { email },
      {
        password: hashedPassword,
        wrong_passwod_attemps: 0,
        blocked_until_password: null,
      }
    );
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model("User", UserSchema);

export default User;
