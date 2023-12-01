const mongoose=require("mongoose");

const userSchema=new mongoose.Schema({
    userId:{
        type:String,
    },
    pw:{
        type:String,
    },
    name:{
        type:String,
        required:[true,"User must type name"],
        
    },
    token:{
        type:String,
    },
    online:{
        type:Boolean,
        default:false,
    },
    rooms:[{
        type:mongoose.Schema.ObjectId,
        ref:"Room"
    }]
},
{timestamps:true});
module.exports=mongoose.model("User",userSchema);