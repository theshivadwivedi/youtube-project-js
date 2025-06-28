import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    const aggregate=Comment.aggregate([
        {
            $match:{
                postId:new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"user",
                foreignField:"id",
                as:"user"
            }
        },
        { $unwind: "$user" },
    {
      $project: {
        _id: 1,
        content: 1,
        createdAt: 1,
        "user._id": 1,
        "user.username": 1,
        "user.avatar": 1
      }
    },
    { $sort: { createdAt: -1 } }
  ]);

  const options = {
    page,
    limit
  };

  const paginatedComments = await Comment.aggregatePaginate(aggregate, options);

  res
    .status(200)
    .json(new ApiResponse(200, paginatedComments, "Comments fetched successfully"));
});


const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    
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