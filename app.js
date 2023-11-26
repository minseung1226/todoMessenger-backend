const express=require("express");
const mongoose=require("mongoose");
require(`dotenv`).config();
const cors=require("cors");
const app=express();
const Room=require("./Models/room")
app.use(cors());

app.get("/",async(req,res)=>{
    Room.insertMany([
        {
            room:"자바스크립트 단톡방",
            members:[],
        },
        {
            room:"리엑트 단톡방",
            members:[],
        },
        {
            room:"NodeJS 단톡방",
            members:[],
        },
    ])
    .then(()=>res.send("ok"))
    .catch((err)=>res.send(err));
});
mongoose.connect(process.env.DB,{
    
    useUnifiedTopology:true,
}).then(()=>console.log("database connected"));

module.exports=app;
