import express from "express";
import {
  getMyProfile,
  login,
  signup,
  logout,
  updateProfile,
  changePassword,
  updatePic,
  forgetPassword,
  resetPassword,
} from "../controllers/user.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

//////// auth

router.post("/login", login);
router.post("/new", singleUpload, signup);
router.get("/me", isAuthenticated, getMyProfile);
router.get("/logout", isAuthenticated, logout);

/////////////// updateprofile

router.put("/updateprofile", isAuthenticated, updateProfile);
router.put("/changePassword", isAuthenticated, changePassword);
router.put("/updatepic", isAuthenticated, singleUpload, updatePic);

/////// Forget password and reset password

router.route("/forgetpassword").post(forgetPassword).put(resetPassword);

export default router;
