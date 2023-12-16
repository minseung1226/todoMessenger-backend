const mongoose=require("mongoose");

const userSchema=new mongoose.Schema({
    loginId:{
        type:String,
    },
    pw:{
        type:String,
    },
    name:{
        type:String,
        required:[true,"User must type name"],
        
    },
    socketId:{
        type:String,
    },
    online:{
        type:Boolean,
        default:false,
    },
    rooms:[{
        type:mongoose.Schema.ObjectId,
        ref:"Room"
    }],
    phoneNumber:{
        type:String,
    },
    profileImg:{
        type:String,
    },
    friends:[{
        type:mongoose.Schema.ObjectId,
        ref:"User",
    }]
},
{timestamps:true});
module.exports=mongoose.model("User",userSchema);