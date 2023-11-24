import express from "express";
import { addToPlaylist, changePassword, deleteMyProfile, deleteUser, forgetPassword, getAllUsers, getMyProfile, logOut, login, register, removeFromPlaylist, resetPassword, updateProfile, updateProfilePicture, updateUserRole } from "../controller/userCtrl.js";
import { authorizeAdmin, isAuthenticated } from "../middleware/auth.js";
import { uploadImage } from "../utils/multerImage.js";



export const userRouter = express.Router();

userRouter
.route('/register')
.post(uploadImage.single("image"),register)

userRouter
.route('/login')
.post(login)

userRouter
.route('/logout')
.get(logOut)

userRouter
.route('/me')
.get(isAuthenticated,getMyProfile)
.delete(isAuthenticated,deleteMyProfile)


userRouter
.route('/changepassword')
.put(isAuthenticated,changePassword)

userRouter
.route('/updateprofile')
.put(isAuthenticated,updateProfile)

userRouter
.route('/updateprofilepicture')
.put(isAuthenticated,uploadImage.single("image"),updateProfilePicture)

userRouter
.route('/forgetpassword')
.post(forgetPassword)

userRouter
.route('/resetpassword/:token')
.put(resetPassword)

userRouter.route('/addtoplaylist')
.post(isAuthenticated,addToPlaylist)


userRouter.route("/removefromplaylist").delete(isAuthenticated, removeFromPlaylist);
// Admin Routes
userRouter.route("/admin/users").get(isAuthenticated, authorizeAdmin, getAllUsers);

userRouter
  .route("/admin/user/:id")
  .put(isAuthenticated, authorizeAdmin, updateUserRole)
  .delete(isAuthenticated, authorizeAdmin, deleteUser);


