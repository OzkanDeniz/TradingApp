import User from "../../models/User";
import OTP from "../../models/Otp";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-code";
import { BadRequestError } from "../../errors/bad-request";
import { generateOtp } from "../../services/mailSender";

const verifyOtp = async (req, res) => {
  const { email, otp, otp_type, data } = req.body;

  if (!email || !otp || !otp_type) {
    throw new BadRequestError("Please provide all values");
  } else if (otp_type !== "email" && !data) {
    throw new BadRequestError("Please provide all values");
  }
};

const otpRecord = await OTP.findOne({ email, otp_type })
  .sort({ createdAt: -1 })
  .limit(1);

if (!otpRecord) {
  throw new BadRequestError("Invalid OTP or OTP expired");
}

const isVerified = await otpRecord.compareOTP(otp);
if (!isVerified) {
  throw new BadRequestError("Invalid OTP or OTP expired");
}

await OTP.findByIdAndDelete(otpRecord.id);

switch (otp_type) {
  case "phone":
    await User.findOneAndUpdate({ email }, { phone_number: data });
    break;
  case "reset pin":
    if (!data || data.length !== 4) {
      throw new BadRequestError("PIN should be 4 Digit ");
    }
    await User.updatePIN(email, data);
    break;
  case "reset password":
    await User.updatePassword(email, data);
    break;
  default:
    throw new BadRequestError("Invalid OTP request type");
}

const user = await User.findOne({ email });

if (otp_type === "email" && !user) {
  const register_token = jwt.sign({ email }, process.env.REGISTER_SECRET, {
    expiresIn: process.env.REGISTER_SECRET_EXPIRY,
  });
  return res
    .status(StatusCodes.OK)
    .json({ msg: "OTP verified successfully", register_token });
}

res.status(StatusCodes.OK).json({ msg: "OTP verified successfully" });

const sendOtp = async (req, res) => {
  const { email, otp_type } = req.body;

  if (!email || !otp_type) {
    throw new BadRequestError("Please provide all values");
  }

  const user = await User.findOne({ email });

  if (otp_type === "phone") {
    if (!user) {
      throw new BadRequestError("User not found ");
    }
    if (user.phone_number === req.body.data) {
      throw new BadRequestError("This phone number already in use ");
    }
  } else if (otp_type === "email") {
    if (user) {
      throw new BadRequestError("Email already in use ");
    }
  } else if (otp_type === "reset_password" || otp_type === "reset_pin") {
    if (!user) {
      throw new BadRequestError("User not found ");
    }
  } else {
    throw new BadRequestError("Invalid OTP Request type ");
  }

  const generatedOtp = generateOtp();
  const otpRecord = new OTP({ email, otp: generatedOtp, otp_type });
  await otpRecord.save();

  res
    .status(StatusCodes.OK)
    .json({ msg: "OTP sent to your email successfully" });
};

export { verifyOtp, sendOtp };
