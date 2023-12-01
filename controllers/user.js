import { asyncError } from "../middlewares/error.js";
import { User } from "../models/user.js";
import ErrorHandler from "../utils/errorHandler.js";
import {
  sendToken,
  cookieOptions,
  getDataUri,
  sendEmail,
} from "../utils/features.js";
import cloudinary from "cloudinary";

export const login = asyncError(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("incorrect email or password", 400));
  }

  if (!password) return next(new ErrorHandler("pls enter password", 400));

  // handle error

  const isMatched = await user.comparePassword(password);

  if (!isMatched) {
    return next(new ErrorHandler("incorrect password", 400));
  }

  sendToken(user, res, "welcome back 📍" + `${user.name}`, 200);
});

export const signup = asyncError(async (req, res, next) => {
  const { name, email, password, address, city, pincode, country } = req.body;

  let user = await User.findOne({ email });
  if (user) return next(new ErrorHandler("User already exist", 400));

  let avatar = undefined;
  if (req.file) {
    const file = getDataUri(req.file);
    const myCloud = await cloudinary.v2.uploader.upload(file.content);

    avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

  user = await User.create({
    name,
    email,
    password,
    address,
    city,
    pincode,
    country,
    avatar,
  });

  sendToken(user, res, "Registered successfully", 201);
});

export const getMyProfile = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({
    success: true,
    user,
  });
});

export const logout = asyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      ...cookieOptions,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Logged Out",
    });
});

export const updateProfile = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const { name, email, address, city, pincode, country } = req.body;

  if (name) user.name = name;
  if (email) user.email = email;
  if (address) user.address = address;
  if (city) user.city = city;
  if (pincode) user.pincode = pincode;
  if (country) user.country = country;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated 👍",
  });
});

export const changePassword = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");

  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword)
    return next(new ErrorHandler("incorrect old password & new password", 400));

  const isMatched = await user.comparePassword(oldPassword);

  if (!isMatched) return next(new ErrorHandler("incorrect old password", 400));

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "password changed 👍",
  });
});

export const updatePic = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const file = getDataUri(req.file);

  await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  const myCloud = await cloudinary.v2.uploader.upload(file.content);

  user.avatar = {
    public_id: myCloud.public_id,
    url: myCloud.secure_url,
  };

  await user.save();

  res.status(200).json({
    success: true,
    message: "avatar changed 👍",
  });
});

export const forgetPassword = asyncError(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return next(new ErrorHandler("Incorrect email", 404));

  const randomNumber = Math.random() * (999999 - 100000) + 100000;
  const otp = Math.floor(randomNumber);
  const otp_expires = 1000 * 60 * 15;

  user.otp = otp;
  user.otp_expire = new Date(Date.now() + otp_expires);
  await user.save();

  const message = `your otp for password resetting is ${otp}`;

  try {
    await sendEmail("OTP for password reset", user.email, message);
  } catch (error) {
    user.otp = null;
    user.otp_expire = null;
    await user.save();
    return next(error);
  }

  res.status(200).json({
    success: true,
    message: `Email sent 📧 to ${user.email}`,
  });
});

export const resetPassword = asyncError(async (req, res, next) => {
  const { otp, password } = req.body;
  const user = await User.findOne({
    otp,
    otp_expire: { $gt: Date.now() },
  });

  if (!user) return next(new ErrorHandler("incorrect otp or otp expired", 400));
  if (!password) return next(new ErrorHandler("pls enter new password", 400));
  user.password = password;
  user.otp = undefined;
  user.otp_expire = undefined;
  await user.save();
  res.status(200).json({
    success: true,
    message: "password changed",
  });
});
