const User=require("../Models/user")
const bcrypt=require("bcrypt");
const mongoose=require("mongoose");
const userController={}


userController.checkUser=async(loginId,pw)=>{
    const user=await User.findOne({loginId:loginId});

    if(!user && user.pw!=pw){
        return false;
    }
    return true;
}

userController.saveUser=async(name,loginId,pw)=>{
    const hashedPw=await bcrypt.hash(pw,10);
    let user=new User({
        name:name,
        loginId:loginId,
        pw:hashedPw,
        online:false,
    });

    await user.save();

}

userController.changeSocketId=async(socketId,userId)=>{
    const user=await User.findOne({_id:new mongoose.Types.ObjectId(userId)});
    if(!user) console.log("user not found");
    else{
        user.socketId=socketId;
        await user.save();

    }
}

module.exports=userController