const User=require("../Models/user")
const userController={}

userController.saveUser=async(userName,sid)=>{
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

userController.CheckUser=async(sid)=>{
    const user=await User.findOne({token:sid});
    if(!user){
        throw new Error("user not found");
    }
    console.log("user1=",user.name);

    return user;
}

module.exports=userController