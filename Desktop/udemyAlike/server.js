import { app } from "./app.js";

import cloudinary from "cloudinary"
import {config} from "dotenv"

config({
    path:"./config/config.env"
})

//integrste app with cloudinary
cloudinary.config({ 
    cloud_name: 'dscymtcq3', 
    api_key: '535743416222166', 
    api_secret: '-wg4xjkaZ_mbm6ckNOq7_WfuL1M' 
  });
  
app.listen(process.env.PORT,()=>{
    console.log(`Server on ${process.env.PORT}`);
});
