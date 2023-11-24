import express from "express";
import { addLecture, createCourses, deleteCourse, deleteLecture, getAllCourses, getCourseLectures } from "../controller/courseCtrl.js";
import { uploadImage } from "../utils/multerImage.js";
import { authorizeAdmin, isAuthenticated } from "../middleware/auth.js";
import { uploadVideo } from "../utils/multerVideo.js";

export const courseRouter = express.Router();

courseRouter
.route('/courses')
.get(getAllCourses)

courseRouter
.route('/createcourse')
.post(isAuthenticated,authorizeAdmin,uploadImage.single("image"),createCourses)

courseRouter
.route('/course/:id')
.get(isAuthenticated,authorizeAdmin,getCourseLectures)
.post(isAuthenticated,authorizeAdmin,uploadVideo.single("image"),addLecture)
.delete(isAuthenticated, authorizeAdmin, deleteCourse);

// Delete Lecture
courseRouter.route("/lecture").delete(isAuthenticated, authorizeAdmin, deleteLecture);

