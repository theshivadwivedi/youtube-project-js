import { timeStamp } from "console";
import mongoose,{Schema, schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { type } from "os";

const commentSchema=new schema(
    {
     content :{
        type:String,
        required:true
     },
     video:{
        type:Schema.Types.ObjectId,
        ref:"Video"
     },
     owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
     }
},
{
    timeStamp:true
}
)

   
export const Comment=mongoose.model("Comment",commentSchema)
