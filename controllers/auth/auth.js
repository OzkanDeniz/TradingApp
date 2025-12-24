import { StatusCode } from "http-status-code";
import {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} from "../../errors/index.js";
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

    if (
      user.blocked_until_password &&
      user.blocked_until_password > new Date()
    ) {
      const remainingMinutes = Math.ceil(
        (user.blocked_until_password - new Date()) / (60 * 1000)
      );
      message = `Your account is blocked for password. Please try again after ${remainingMinutes} minute(s)`;
    } else {
      const attemptsRemaining = 3 - user.wrong_password_attempts;
      message =
        attemptsRemaining > 0
          ? `Invalid password, ${attemptsRemaining} attemptsRemaining`
          : "Invalid Login attempts exceeded, Please try after 30 minutes";
    }
    throw new UnauthenticatedError(message);
  }

  const access_token = user.createAccessToken();
  const refresh_token = user.createRefreshToken();

  let phone_exist = false;
  let login_pin_exist = false;

  if (user.phone_number) {
    phone_exist = true;
  }
  if (user.login_pin) {
    login_pin_exist = true;
  }

  res.status(StatusCode.OK).json({
    user: {
      name: user.name,
      email: user.email,
      userId: user._id,
      phone_exist,
      login_pin_exist,
    },
    tokens: { access_token, refresh_token },
  });
};

const refreshToken = async (req, res)=>{
  const {type, refresh_token} = req.body
  if(!type || !["socket", "app"].includes(type) || !refresh_token){
    throw new BadRequestError("Invalid body")
  }
  try{
    let accessToken,newRefreshToken;
    if(type === "app"){
      ({access_token:accessToken, newRefreshToken} = await generateRefreshTokens())
    } 

  }

}

async function generateRefreshTokens(
  token,
  refresh_secret,
  refresh_expiry,
  access_secret,
  access_expiry
) {
  try {
    const payload = jwt.verify(token, refresh_secret);
    const user = await User.findById(payload.userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    const access_token = jwt.sign({ userId: payload.userId }, access_secret, {expiresIn: access_expiry});
    const newRefreshToken = jwt.sign({ userId: payload.userId }, refresh_secret, {expiresIn: refresh_expiry});
    return {access_token, newRefreshToken}

  } catch (error) {
    console.error(error)
    throw new UnauthenticatedError("Invalid Token")
  }
}

export { register, login };
