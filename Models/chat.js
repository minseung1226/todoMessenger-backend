const mongoose=require("mongoose");

const chatSchema=new mongoose.Schema(
    {
        chat:String,
        system:Boolean,
        user:{
            id:{
                type:mongoose.Schema.ObjectId,
                ref:"User",
            },
            name:String,
        },
        room:{
            type:mongoose.Schema.ObjectId,
            ref:"Room",
        },
        unreadMembers:[
            {
                type:mongoose.Schema.ObjectId,
                ref:"User"
            }

        ]
    },
    {timestamps:true}

);

module.exports=mongoose.model("Chat",chatSchema);