import { catchAsyncError } from "../middleware/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import { User } from "../models/User.js";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto"
import {Course} from "../models/Course.js"
import cloudinary from "cloudinary"

export const register = catchAsyncError(
     async(req,res,next)=>{

const {name,email,password} = req.body

// const file = req.file

if(!name || !email || !password){
    return next(new ErrorHandler('Enter all fields',400))
}

let user  = await User.findOne({email})
if(user) return next(new ErrorHandler('user exists',409))

if (req.file) {
  // console.log(req.file);

  // cloudinary
  cloudinary.v2.uploader.upload(
    req.file.path,
    { folder: "udemy-clone" },
    async (error, result) => {
      // console.log(result);
      user =await User.create({
        name,
        email,
        password,
        avatar: {
          public_id: result.public_id,
          url: result.secure_url,
          },
    })
    sendToken(res,user,'Registered success',201)
     
    }
  );
} 



     }
)

export const login = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
  
    if (!email || !password)
      return next(new ErrorHandler("Please enter all field", 400));
  
    const user = await User.findOne({ email }).select("+password");
  
    if (!user) return next(new ErrorHandler("Incorrect Email or Password", 401));
  
    const isMatch = await user.comparePassword(password);
  
    if (!isMatch)
      return next(new ErrorHandler("Incorrect Email or Password", 401));
  
    sendToken(res, user, `Welcome back, ${user.name}`, 200);
  });

export const logOut = catchAsyncError(async (req, res, next) => {
    res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    //   secure: true,
      sameSite: "none",
    })
    .json({
      success: true,
      message: "Logged Out Successfully",
    });
  });

export const getMyProfile = catchAsyncError(async (req, res, next) => {

const user = await User.findById(req.user._id).select("+ResetPasswordToken")


    res
    .status(200)
    .json({
      success: true,
      message: "Profile Fetch Successfully",user
    });
  });

  export const changePassword = catchAsyncError(async (req, res, next) => {

const {oldpassword,newpassword} = req.body;

    const user = await User.findById(req.user._id).select("password")
    
    const isMatch = await user.comparePassword(oldpassword);
  
    if (!isMatch)   return next(new ErrorHandler("Incorrect Email or Password", 401));

      user.password = newpassword;

      await user.save();
    
      res.status(200).json({
        success: true,
        message: "Password Changed Successfully",
      });

      });

  
  export const updateProfile = catchAsyncError(async (req, res, next) => {
        const { name, email } = req.body;
      
        const user = await User.findById(req.user._id);
      
        if (name) user.name = name;
        if (email) user.email = email;
      
        await user.save();
      
        res.status(200).json({
          success: true,
          message: "Profile Updated Successfully",
        });
      });

  export const updateProfilePicture = catchAsyncError(
        async(req,res,next)=>{
          const user = await User.findById(req.user._id);

          //delete user profile
await cloudinary.v2.uploader.destroy(user.avatar.public_id,{folder: "udemy-clone"});

//upload new pic
  // cloudinary
  cloudinary.v2.uploader.upload(
    req.file.path,
    { folder: "udemy-clone" },
    async (error, result) => {
      // console.log(result);
      user.avatar= {
          public_id: result.public_id,
          url: result.secure_url,
          }
          await user.save();
          res.status(200).json({
            success:true,msg:"Profile picture Updated",user
          })
    })
    
     
    }
  );

  export const forgetPassword = catchAsyncError(                                                     
          async(req,res,next)=>{
         
const {email} = req.body

const user = await User.findOne({email});
if (!user) return next(new ErrorHandler("User not found", 400));

const resetToken = await user.getResetToken()
// console.log(resetToken);
//send as email
await user.save()                                                         

const url = `${process.env.FRONTEND_URL}/api/v1/resetpassword/${resetToken}`;

const message = `Click on the link to reset your password. ${url}. If you have not request then please ignore.`;

await sendEmail(user.email, "Reset Password", message);

            res.status(200).json({
              success:true,msg:"Email sent , check your mail to reset passowrd"
            })
          }
          )

export const resetPassword = catchAsyncError(async (req, res, next) => {
            const { token } = req.params;
          
            const resetPasswordToken = crypto
              .createHash("sha256")
              .update(token)
              .digest("hex");

          // console.log(resetPasswordToken);
          
            const user = await User.findOne({
              resetPasswordToken,
              ResetPasswordExpire: {
                $gt: Date.now(),
              },
            });
          
            if (!user)
              return next(new ErrorHandler("Token is invalid or has been expired", 401));
          
            user.password = req.body.password;
            user.ResetPasswordToken = undefined;
            user.ResetPasswordExpire = undefined;
          
            await user.save();
          
            res.status(200).json({
              success: true,
              message: "Password Changed Successfully",
            });
          });


 export const addToPlaylist = catchAsyncError(
  async(req,res,next)=>{

    const user = await User.findById(req.user._id);
    const course = await Course.findById(req.body.id)

    if (!course) return next(new ErrorHandler("Invalid Course Id", 404)); 

    const itemExist = user.playlist.find((item) => {
      if (item.course.toString() === course._id.toString()) return true;
    });
  
    if (itemExist) return next(new ErrorHandler("Item Already Exist", 409));

    user.playlist.push({
      course:course._id,
      poster:course.poster.url
    })

await user.save()

res.status(200).json({
  success:true,
  msg:'Added to playlist'
})

  }
 )

 export const removeFromPlaylist = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const course = await Course.findById(req.query.id);
  if (!course) return next(new ErrorHandler("Invalid Course Id", 404));

  const newPlaylist = user.playlist.filter((item) => {
    if (item.course.toString() !== course._id.toString                                                                  ()) return item;
  });

  user.playlist = newPlaylist;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Removed From Playlist",
  });
});

// admin Controllers

export const getAllUsers = catchAsyncError(
  async(req,res,next)=>{
    
    const users = await User.find({});

    res.status(200).json({
      success: true,
      users,
    });


  }
)

export const updateUserRole = catchAsyncError(
  async(req,res)=>{
    const user = await User.findById(req.params.id);
    if (!user) return next(new ErrorHandler("User not found", 404));
if(user.role==='user') user.role = 'admin'
else{
  user.role = 'user'
}
await user.save();

res.status(200).json({
  success: true,
  message: "Role Updated",
});
   
  }
)

export const deleteUser = catchAsyncError(
  async(req,res)=>{

    const user = await User.findById(req.params.id);

    if (!user) return next(new ErrorHandler("User not found", 404));

    //delete asset from cloudinary
await cloudinary.v2.uploader.destroy(user.avatar.public_id,{
  folder:"udemy-clone",
})

//susbscription delete

//delete document from collection
await user.remove();

res.status(200).json({
  success: true,
  message: "User Deleted Successfully",
});

  }
)

export const deleteMyProfile = catchAsyncError(
  async(req,res)=>{

    const user = await User.findById(req.user._id);
    //delete asset from cloudinary
    await cloudinary.v2.uploader.destroy(user.avatar.public_id,{
      folder:"udemy-clone",
    })

  // Cancel Subscription

  await user.remove();

  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "User Deleted Successfully",
    });

  }
)

