const User=require("../Models/user")
const bcrypt=require("bcrypt");
const mongoose=require("mongoose");
const ErrorTypes=require("../errorTypes/ErrorTypes");
const userController={}


userController.checkUser=async(loginId,pw)=>{
    const user=await User.findOne({loginId:loginId});

    if(!user && user.pw!=pw){
        return false;
    }
    return true;
}

userController.findFriend=async(userId,friendLoginId)=>{
    const friend=await User.findOne({loginId:friendLoginId});
    if(!friend || userId===friend._id.toString()){
        const error=new Error("friend_not_found");
        error.type=ErrorTypes.FRIEND_NOT_FOUND
        throw error;
    }

    const user=await User.findOne({_id:userId});

    if(user.friends.some(id=>id.toString()===friend._id.toString())){
        const error=new Error("already_friend");
        error.type=ErrorTypes.ALREADY_FRIEND;
        throw error;
    }

    return friend;

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

userController.addFriend=async(userId,friendId)=>{
    const user=await User.findOne({_id:userId});
    user.friends.push(friendId);
    await user.save();
}

userController.toggleOnlineStatus=async(userId,status)=>{
    try{
        const user=await User.findOne({_id:userId});
        user.online=status;
        await user.save();
    }catch(err){
        console.log("change online status error");
        throw err;
    }
}
userController.findByLoginId=async(loginId)=>{
    return await User.findOne({loginId:loginId})
}

userController.findByPhoneNumber=async (phoneNumber)=>{
    return await User.findOne({phoneNumber:phoneNumber});
}

userController.findFriends=async(userId)=>{
    try{
        const user=await User.findOne({_id:userId});

        return await User.find({_id:{$in:user.friends}}).select('id name online profileImg');
    }catch(err){
        console.log("find friends Error");
        throw err;
    }
}

module.exports=userController