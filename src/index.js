import dotenv from "dotenv"
import connectDB from "./db/index.js";

dotenv.config({
    path:'./env'
})
connectDB()








// ++++++++++++++  by IIFE function   ++++++++++++++++++++ 

// (async ()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error",(error)=>{
//             console.log("Err:",error);
//             throw error
            
//         })
//         app.listen(process.env.PORT,()=>{
//             console.log(`App is listening on port${process.env.PORT}`);
            
//         })
//     } catch (error) {
//         console.log("error",error);
//         throw error
        
//     }

// })()
 