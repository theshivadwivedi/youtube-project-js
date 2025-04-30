import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js "
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt  from "jsonwebtoken";
const generateAccessAndRefreshToken=async(userId)=>{
    try {
        const user= await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()
        user.refreshToken=refreshToken
        await  user.save({validateBeforeSave:false})
        return{accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating access and refresh ")
    }
}
const registerUser=asyncHandler(async(req,res)=>{
   



    const {username,email,fullname,password}=req.body
    console.log("email:",email);

    if (
        [fullname,email,username,password].some((fields)=>fields?.trim()==="")

    ) 
        {
            throw new ApiError(400,"All fields are required")
        
    }
    // console.log(req.body)
    
    const existedUser= await User.findOne({
        $or: [{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409,"User with same username and email is existed")
    }const avatarLocalPath = req.files?.avatar?.[0]?.path || "";
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path || "";
    
    // console.log("Files:", req.files);
    
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required" )
    }
        

    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)

    console.log("Avatar upload result:", avatar);
console.log("Cover image upload result:", coverImage);

    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }
    const user  =await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })
    const createdUser= await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user");
        
    }
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registered Successfully")
    )
})

const loginUser=asyncHandler(async(req,res)=>{
    //  req-> body
    // username or email
    // find the user
    // password check
    // accesstoken and refreshtoken generate
    // send cookies
    
      const {email,username,password}=req.body

      if(!username && !email){
        throw new ApiError(400,"username or email is required")
      }
      
      const user= await User.findOne({
         $or:[{username},{email}]
      }) 
      const isPasswordValid= await user.isPasswordCorrect(password)
      if(!isPasswordValid){
        throw new ApiError(401,"Invalid password")
      }
          const {refreshToken,accessToken}=await  generateAccessAndRefreshToken(user._id)
         const loggedInUser= await User.findById(user._id).
         select("-password -refreshToken")

         const options={
            httpOnly:true,
            secure:true
         }
         return res
         .status(200)
         .cookie("accessToken",accessToken, options)
         .cookie("refreshToken",refreshToken,options)
         .json(
            new ApiResponse(
                200,
                {
                    user:loggedInUser,accessToken,refreshToken
                },
                "User logged In Successfully"
            )
         )
})

const logoutUser=asyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(
    req.user._id,
    {
   $set:{
       refreshToken:undefined
   }
    },
    {
        new:true
    }
  )
  const options={
    httpOnly:true,
    secure:true
 }
 return res.status(200)
 .clearCookie("accessToken",options)
 .clearCookie("refreshToken",options)
 .json(new ApiResponse(200,{},"User logged Out Successfully"))

})
const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken

    if(incomingRefreshToken){
        throw new ApiError(401,"unauthorized Access")
    }

     try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
          )
    
         const user= await User.findById(decodedToken?._id)
         if(!user){
            throw new ApiError(401,"Invalid refresh token")
        }
        if (incomingRefreshToken !==user?.refreshToken) {
            throw new ApiError(401,"Refesh token expired or used")
        }
        const options={
            httpOnly:true,
            secure:true
        }
        const {newRefreshToken,accessToken}=await generateAccessAndRefreshToken(user._id)
        return res
        .status (200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
         .json(
            new ApiResponse(
                200,
                { accessToken ,refreshToken: newRefreshToken},
                "Access token refreshed"
            )
         )
     } catch (error) {
         throw new ApiError(401,error?.message || "Inavalid refresh token")
     }
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}