const User=require("../Models/user")
const bcrypt=require("bcrypt");
const userController={}


userController.checkUser=async(userId,pw)=>{
    const user=await User.findOne({userId:userId});

    if(!user && user.pw!=pw){
        return false;
    }
    return true;
}

userController.saveUser=async(name,userId,pw)=>{
    const hashedPw=await bcrypt.hash(pw,10);
    let user=new User({
        name:name,
        userId:userId,
        pw:hashedPw,
        online:false
    });

    await user.save();

}


userController.saveUser2=async(userName,sid)=>{
    //이미 있는 유저인지 확인
    let user = await User.findOne({name:userName});
    //없다면 새유저 만들기
    if(!user){
        user=new User({
            name:userName,
            token:sid,
            online:true,
            

        });
    }
    //있다면 유저라면 연결정보 token값만 변경
    user.token=sid;
    user.online=true;

    await user.save();

    
    return user;
}

userController.CheckUser1=async(sid)=>{
    const user=await User.findOne({token:sid});
    if(!user){
        throw new Error("user not found");
    }
    console.log("user1=",user.name);

    return user;
}

module.exports=userController