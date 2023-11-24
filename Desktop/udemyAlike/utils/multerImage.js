import express from "express";
import multer from "multer";
import path from "path"
import cloudinary from "cloudinary"

const app = express();


//Setting storage engine
const storageEngine = multer.diskStorage({
  destination: "./upload/images",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}--${file.originalname}`);
  },
});

//validatuon
const checkFileType = function (file, cb) {
  //Allowed file extensions
  const fileTypes = /jpeg|jpg|png|gif|svg/;

  //check extension names
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

  const mimeType = fileTypes.test(file.mimetype);

  if (mimeType && extName) {
    return cb(null, true);
  } else {
    cb("Error: You can Only Upload Images!!");
  }
};

export const uploadImage = multer({
  storage: storageEngine,
  limits: { fileSize: 10000000 },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});


// app.post("/single", uploadImage.single("image"), (req, res) => {
//   if (req.file) {
//     console.log(req.file);

// // cloudinary 
// cloudinary.v2.uploader.upload(req.file.path,{folder:"test"},
// async(error,result)=>{
//   console.log(result);
// }
// )

//     res.send("Single file uploaded successfully");
//   } else {
//     res.status(400).send("Please upload a valid image");
//   }
// });

// app.listen(2023,()=>{
//     console.log(`Server on 2023`);
// })
