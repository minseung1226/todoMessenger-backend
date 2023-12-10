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


app.get("/",async(req,res)=>{
    
    await userController.saveUser("민준4","qwer","qwer");
    const user=await User.findOne({name:"민준4"});
    Room.insertMany([
        {
            room:"자바스크립트 단톡방",
            members:[user._id],
        },
        {
            room:"리엑트 단톡방",
            members:[user._id],
        },
        {
            room:"NodeJS 단톡방",
            members:[user._id],
        },
    ])
    .then(()=>res.send("ok"))
    .catch((err)=>res.send(err));
});

app.get("/findUser",authenticateToken,async(req,res)=>{
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
        const user2=await User.findOne({_id:user._id});
        const token=jwt.sign({userId:user.id},process.env.JWT_SECRET_KEY,{expiresIn:'1h'});
        res.json({ok:true,token:token});
    }
})

app.post("/idDuplication",async(req,res)=>{

    const user=await User.findOne({userId:req.body.userId});
    res.json({ok:user?false:true});
})
app.post("/join",async(req,res)=>{
    const body=req.body;
    await userController.saveUser(body.name,body.loginId,body.pw);

    res.json({ok:true});
})

app.post("/rooms",authenticateToken,async(req,res)=>{
    Room.find({members:req.userId.userId})
        .populate('members')
        .exec()
        .then((rooms)=>{
         
            res.json({rooms:rooms})})
        .catch(err=>{
            console.error(err);
            res.status(500).send("/rooms error")})
})

app.post("/createRoom",authenticateToken,async(req,res)=>{

    const roomId=await roomController.createRoom(req.body.roomName,[req.userId.userId]);
    if(!roomId) res.status(500).send("/createRoom create error");
    res.json({ok:true,roomId:roomId});
})
mongoose.connect(process.env.DB).then(()=>console.log("database connected"));

module.exports=app;
