const mongoose=require("mongoose");

const roomSchema=new mongoose.Schema(
    {
        roomName:String,
        members:[
            {
                type:mongoose.Schema.ObjectId,
                ref:"User",
            },
        ],
    },
    {timestamps:true}
);

module.exports=mongoose.model("Room",roomSchema);