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


app.get("/user",authenticateToken,async(req,res)=>{
    const roomId= querystring.parse(url.parse(req.url).query).roomId;

    const user=await User.findOne({id:req.userId._userId});
    user.rooms.push(roomId);
    await user.save();

    res.json({user:user});
});

app.post("/login",async(req,res)=>{
    const user=await User.findOne({loginId:req.body.loginId});
    if(!user || !await bcrypt.compare(req.body.pw,user.pw)){
        res.json({ok:false});
    }
    else{
        const token=jwt.sign({userId:user.id},process.env.JWT_SECRET_KEY,{expiresIn:'1h'});
        res.json({ok:true,token:token});
    }
})

app.post("/idDuplication",async(req,res)=>{

    const user=await User.findOne({userId:req.body.loginId});
    console.log("user=",user);
    res.json({ok:user?false:true});
})
app.post("/join",async(req,res)=>{
    const body=req.body;
    await userController.saveUser(body.name,body.loginId,body.pw);

    res.json({ok:true});
})

app.get("/rooms",authenticateToken,async(req,res)=>{
    try{
        const roomAndUserAndChat=await roomController.findAllRoom(req.userId.userId);
        console.log("rooms=",roomAndUserAndChat);
        res.json({ok:true,chatRoomsInfo:roomAndUserAndChat});
    }catch(err){
        res.status(500).send("/rooms failed to retrieve chat room list")
    }
    
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

//방생성 모든 친구 조회
//현재코드 : 모든 유저 조회 (수정필요)
app.get("/friends",authenticateToken,async(req,res)=>{
    try{
        const friends=await User.find();
        res.json({friends:friends});    
    }catch(err){
        console.log("err=",err);
    }
    
})


app.post("/room",authenticateToken,async(req,res)=>{
    friends=req.body.friends;
    friends.push(req.userId.userId);
    const roomId=await roomController.createRoom(friends);
    if(!roomId) res.status(500).send("/createRoom create error");
    res.json({ok:true,roomId:roomId});
})
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
// req=> friendId,token(userId)
// res => message={ok,duplicate,error}
app.post("/friend/request",authenticateToken,async(req,res)=>{
    const user=await User.findById(req.userId.userId);
    if(!user.friends.includes(req.body.friendId)){
        res.json({message:"duplication"})
    }
    const friend=await User.findById(req.body.friendId);

    user.friends.push(friend._id);

    res.json({message:"ok"});
})
mongoose.connect(process.env.DB).then(()=>console.log("database connected"));

module.exports=app;
