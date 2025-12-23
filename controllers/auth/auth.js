import { StatusCode } from "http-status-code";
import { BadRequestError, UnauthenticatedError } from "../../errors/index.js";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";

const register = async (req, res) => {
  const { email, password, reqister_token } = req.body;
  if (!email || !password || !reqister_token) {
    throw new BadRqquestError("Please provide all values");
  }

  const user = await User.findOne({ email });
  if (user) {
    throw new BadRequestError("User already exists");
  }

  try {
    const payload = jwt.verify(reqister_token, process.env.REGISTER_SECRET);
    if (payload.email !== email) {
      throw new BadRequestError("Invalid register token");
    }

    const newUser = await User.create({ email, password });
    const access_token = newUser.createAccessToken();
    const refresh_token = newUser.createRefreshToken();
    res.status(StatusCode.CREATED).json({
      user: { email: newUser.email, userId: newUser.id },
      tokens: { access_token, refresh_token },
    });
  } catch (error) {
    console.error(error);
    throw new BadRequestError("Invalid body");
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("Please provide all values");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new UnauthenticatedError("Invalid Credentials");
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    let message;

    if(user.blocked_until_password && user.blocked_until_password > new Date()){
        const remainingMinutes = Math.ceil((user.blocked_until_password - new Date()) / (60*1000))
        message = `Your account is blocked for password. Please try again after ${remainingMinutes} minute(s)`
    }else{
      const attemptsRemaining = 3 - user.wrong_password_attempts; 
      message = attemptsRemaining > 0 ? `Invalid password, ${attemptsRemaining} attemptsRemaining` : "Invalid Login attempts exceeded, Please try after 30 minutes"
    }
    throw new UnauthenticatedError(message)
  }
};
