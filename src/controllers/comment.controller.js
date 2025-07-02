import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const comments=Comment.aggregate([
        {
            $match:{
                postId:videoId
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner"
            }
        },
       {
        $lookup:{
          from:"likes",
          localField:"_id",
          foreignField:"comment",
          as:"likes"
        }
       },
       {
        $addFields: {
          likesCount: { $size: "$likes" },
          owner: {
            $arrayElemAt: ["$owner", 0] // Assuming owner is an array
        },
        isliked: {
            $cond: {
              if: { $in: [user._id, "$likes.user"] },
              then: true,
              else: false
            }
       }
    }
},
  {
    $project: {
      content: 1,

      likesCount: 1,
      isliked: 1,
      "owner._id": 1,
      "owner.fullName": 1,
      "owner.avatar": 1,
      "owner.username": 1
    }
  }
  ]);

 
 
 return  res
    .status(200)
    .json(new ApiResponse(200, Comments, "Comments fetched successfully"));
});


const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
     
    const {videoId}= req.params;
    const comment=req.body;
    if(!comment?.trim()){
        throw new ApiError(400,"comment is required");

    }
    const user= await User.findById(req.user._id)
    if(!user){
           throw new ApiError(404,"User not found")
    }
    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "video not found");
    }
    
    const newComment = await Comment.create({
        content: comment,
        video: videoId,
        owner: user._id
    });
   return res.status(201).json(new ApiResponse(201, newComment, "Comment added successfully"));
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }