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
  } else if (!otp_type !== "email" && !data) {
    throw new BadRequestError("Please provide all values");
  }
};

const otpRecord = await OTP.findOne({ email, otp_type })
  .sort({ createdAt: -1 })
  .limit(1);

  if(!otpRecord){
    throw new BadRequestError("Invalid OTP or OTP expired");
  }

  const isVerified = await otpRecord.compareOTP(otp)
  if(!isVerified){
    throw new BadRequestError("Invalid OTP or OTP expired")
  }

  await OTP.findbyIdAndDelete(otpRecord.id)