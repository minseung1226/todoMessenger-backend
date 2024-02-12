const mongoose=require("mongoose")


const scheduleSchema=new mongoose.Schema(
    {
        title:String,
        message:String,
        notificationTime:Date,
        user:{
            id:{
                type:mongoose.Schema.ObjectId,
                ref:"User"
            }
        }
    },
    {timestamps:true}
);

module.exports=mongoose.model("Schedule",scheduleSchema);