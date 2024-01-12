const express=require("express");
const mongoose=require("mongoose");
require(`dotenv`).config();
const cors=require("cors");
const app=express();
const Room=require("./Models/room");
const User=require("./Models/user");
const session = require("express-session");
const crypto= require("crypto");
const user = require("./Models/user");
const userController = require("./Controllers/user.controller");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcrypt");
const url=require("url");
const querystring = require('querystring');
const roomController = require("./Controllers/room.controller");
const ErrorTypes=require("./errorTypes/ErrorTypes");
const { error } = require("console");
app.use(cors());
app.use(express.json());
app.use(session({
    secret:crypto.randomBytes(64).toString('hex'),
    resave:false,
    saveUninitialized:true,
    cookie:{secure:true}
}));

//token 검증
function authenticateToken(req,res,next){
    const token=req.headers.authorization?.split(' ')[1];

    if(!token){
        return res.status(401).send("not found Token");
    }

    jwt.verify(token,process.env.JWT_SECRET_KEY,(err,userId)=>{
        if(err) return res.status(403).send('Invalid token');
        req.userId=userId;
        next();
    })
}



app.post("/login",async(req,res)=>{
    const user=await User.findOne({loginId:req.body.loginId});
    if(!user || !bcrypt.compare(req.body.pw,user.pw)){
        res.json({ok:false});
    }
    else{
        await userController.toggleOnlineStatus(user._id,true);
        const token=jwt.sign({userId:user.id},process.env.JWT_SECRET_KEY,{expiresIn:'1h'});
        res.json({ok:true,token:token});
    }
})

app.patch("/logout",authenticateToken,async(req,res)=>{
    try{
        await userController.toggleOnlineStatus(req.userId.userId,false);
        res.json({ok:true});
    }catch(err){
        console.log("logout error");
        res.status(500).send("logout error");
    }
})

app.post("/idDuplication",async(req,res)=>{

    const user=await User.findOne({userId:req.body.loginId});
    res.json({ok:user?false:true});
})
app.post("/join",async(req,res)=>{
    const body=req.body;
    await userController.saveUser(body.name,body.loginId,body.pw);

    res.json({ok:true});
})



// 인증번호 발송
//req => phoneNumber
app.post("/sendCode",async(req,res)=>{
    try{
        const randomNumber = Math.floor(Math.random() * 9000) + 1000;
        res.json({code:randomNumber});
        console.log("code=",randomNumber);
    }catch(err){
        console.log("err=",err);
    }
})




app.post("/room",authenticateToken,async(req,res)=>{
    friends=req.body.friends;
    friends.push(req.userId.userId);
    const roomId=await roomController.createRoom(friends);
    const room = await Room.findOne({_id:roomId});
    if(!roomId) res.status(500).send("/createRoom create error");
    res.json({ok:true,roomId:roomId});
})

//사용자 검색
// req => loginId or phoneNumber
app.get("/user/search",async(req,res)=>{
    const loginId=req.body.loginId;
    const phoneNumber=req.body.phoneNumber;
    const user="";
    if(loginId){
        user=userController.findByLoginId(loginId);
    }else{
        user=userController.findByPhoneNumber(phoneNumber);
    }
    res.json({user:user});
});

// 사용자 검색 
app.get("/user",authenticateToken,async(req,res)=>{
    
    try{
       const friend= await userController.findFriend(req.userId.userId,req.query.friendLoginId);
        res.json({user:friend});
    }catch(err){
        if(err.type===ErrorTypes.ALREADY_FRIEND){
            res.json({errorMessage:"이미 친구로 등록된 사용자 입니다."})
        }
        else if(err.type===ErrorTypes.FRIEND_NOT_FOUND){
            res.json({errorMessage:"잘못된 id 입니다."})
        }
        else{
            res.status(500).send("/user/search error");
        }
        }
});

app.patch("/friend/request",authenticateToken,async(req,res)=>{
    try{
        await userController.addFriend(req.userId.userId,req.body.friendId);
        
        res.json({ok:true});

    }catch(err){
        console.log("/friend/request error");
        throw err;
    }
})
mongoose.connect(process.env.DB).then(()=>console.log("database connected"));

module.exports=app;
