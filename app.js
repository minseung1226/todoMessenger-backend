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
app.use(cors());
app.use(express.json());
app.use(session({
    secret:crypto.randomBytes(64).toString('hex'),
    resave:false,
    saveUninitialized:true,
    cookie:{secure:true}
}));


app.get("/",async(req,res)=>{
    
    const user=new User({
        name:"강민승",
        token:"^^",
        userId:123,
        pw:123,
    })
    await user.save();
    Room.insertMany([
        {
            room:"자바스크립트 단톡방",
            members:[user],
        },
        {
            room:"리엑트 단톡방",
            members:[user],
        },
        {
            room:"NodeJS 단톡방",
            members:[user],
        },
    ])
    .then(()=>res.send("ok"))
    .catch((err)=>res.send(err));
});

app.post("/login",async(req,res)=>{
    console.log(process.env.JWT_SECRET_KEY);
    const user=await User.findOne({userId:req.body.userId});
    if(!user || !await bcrypt.compare(req.body.pw,user.pw)){
        res.json({ok:false});
    }
    else{
        const token=jwt.sign({userId:user.userId},process.env.JWT_SECRET_KEY,{expiresIn:'1h'});
        res.json({ok:true,token:token});
    }
})

app.post("/idDuplication",async(req,res)=>{

    const user=await User.findOne({userId:req.body.userId});
    res.json({ok:user?false:true});
})
app.post("/join",async(req,res)=>{
    const body=req.body;
    await userController.saveUser(body.name,body.userId,body.pw);

    res.json({ok:true});
})
mongoose.connect(process.env.DB).then(()=>console.log("database connected"));

module.exports=app;
