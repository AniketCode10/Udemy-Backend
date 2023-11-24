import express from "express";
import multer from "multer";
import path from "path"

                                                                                                                                                                                                                                               
const app = express();


//Setting storage engine
const storageEngine = multer.diskStorage({
  destination: "./upload/video",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}--${file.originalname}`);
  },
});

//validatuon
const checkFileType = function (file, cb) {
  //Allowed file extensions
  const fileTypes = /mp4||avi|mkv|webm/;

  //check extension names
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

  const mimeType = fileTypes.test(file.mimetype);

  if (mimeType && extName) {
    return cb(null, true);
  } else {
    cb("Error: You can Only Upload videos!!");
  }
};

export const uploadVideo  = multer({
  storage: storageEngine,
  limits: { fileSize: 50000000 },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});



