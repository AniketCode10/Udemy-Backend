import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { Course } from "../models/Course.js";

import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from "cloudinary";

export const createCourses = catchAsyncError(async (req, res, next) => {
  const { title, description, category, createdBy } = req.body;

  if (!title || !description || !category || !createdBy)
    return next(new ErrorHandler("Please add all fields", 400));

  if (req.file) {
    // console.log(req.file);

    // cloudinary
    cloudinary.v2.uploader.upload(
      req.file.path,
      { folder: "udemy-clone" },
      async (error, result) => {
        // console.log(result);
        let course = await Course.create({
          title,
          description,
          category,
          createdBy,
          poster: {
            public_id: result.public_id,
            url: result.secure_url,
          },
        });
        res.status(201).json({
          success: true,
          message: "Course Created Successfully. You can add lectures now.",
          course,
        });
      }
    );
  } else {
    res.status(400).send("Please upload a valid image");
  }
});

export const getAllCourses = catchAsyncError(async (req, res, next) => {
  const courses = await Course.find();

  res.status(200).json({
    success: true,
    courses,
  });
});

export const getCourseLectures = catchAsyncError(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) return next(new ErrorHandler("Course not found", 404));

  course.views += 1;

  await course.save();

  res.status(200).json({
    success: true,
    lectures: course.lectures,
  });
});

export const addLecture = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { title, description } = req.body;

  const course = await Course.findById(id);

  if (!course) return next(new ErrorHandler("Course not found", 404));

  if (req.file) {
    // console.log(req.file);

    // cloudinary
    cloudinary.v2.uploader.upload(
      req.file.path,
      { resource_type: "video", folder: "udemy-clone" },
      async (error, result) => {
        // console.log(result);
        course.lectures.push({
          title,
          description,
          video: {
            public_id: result.public_id,
            url: result.secure_url,
          },
        });
        course.numOfVideos = course.lectures.length;

        await course.save();
        res.status(201).json({
          success: true,
          message: "Lecture Added Success",course
        });
      }
    );
  }
});

export const deleteCourse = catchAsyncError(
  async(req,res)=>{
const {id} = req.params
const course = await Course.findById(id);
if(!course) return next(new ErrorHandler('Course not found',404))
//delete course thumbnail
await cloudinary.v2.uploader.destroy(course.poster.public_id,{folder: "udemy-clone"});
//delete course lecture

for (let i = 0; i < course.lectures.length; i++) {
  const singleLecture = course.lectures[i];
  await cloudinary.v2.uploader.destroy(singleLecture.video.public_id, {
    resource_type: "video",folder: "udemy-clone"
  });
}

await course.remove();

res.status(200).json({
  success: true,
  message: "Course Deleted Successfully",
});
  }
)

export const deleteLecture = catchAsyncError(
  async(req,res,next)=>{
    const { courseId, lectureId } = req.query;

    const course = await Course.findById(courseId);
    if (!course) return next(new ErrorHandler("Course not found", 404));
//finding lecture and deleting

    const lecture = course.lectures.find((item) => {
      if (item._id.toString() === lectureId.toString()) return item;
    });

    await cloudinary.v2.uploader.destroy(lecture.video.public_id, {
      resource_type: "video",folder: "udemy-clone"
    });
// finding exact number of videos
course.lectures = course.lectures.filter((item) => {
  if (item._id.toString() !== lectureId.toString()) return item;
});

course.numOfVideos = course.lectures.length;

await course.save();

res.status(200).json({
  success: true,
  message: "Lecture Deleted Successfully",
});

  }
)