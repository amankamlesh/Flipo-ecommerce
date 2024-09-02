import {TryCatch} from "./error.js"
import ErrorHandler from "../utils/utility-class.js";
import { User } from "../models/user.js";

//middleware -only admin allowed
export const adminOnly=TryCatch(async(req,res,next)=>{
const {id}=req.query;

if(!id) return next(new ErrorHandler("login please",400));


const user=await User.findById(id);
if(!user) return next(new ErrorHandler("fake id",401));

if(user.role!="admin")
     return next(new ErrorHandler("sorry,you are not admin",403));


next();

})