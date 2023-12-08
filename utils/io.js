const chatController = require("../Controllers/chat.controller");
const roomController = require("../Controllers/room.controller");
const userController=require("../Controllers/user.controller")
const jwt=require("jsonwebtoken");
const User=require("../Models/user")
module.exports=function(io){



    
    //io ~~~~
    io.on("connection",async(socket)=>{
        console.log("client is connected",socket.id);

        socket.on("saveSocketId",async(token,cb)=>{
            let userId="";

            jwt.verify(token,process.env.JWT_SECRET_KEY,(err,data)=>{
                if(err)console.log("err=",err);

                userId=data.userId;
            });
            await userController.changeSocketId(socket.id,userId);

            const u=await User.findOne({_id:userId});

            cb({ok:true});

        })
        
        socket.on("getAllChats",async(roomId,cb)=>{
            try{
                
                
                const chats=await chatController.findChatsByRoomId(roomId);
                cb({chats:chats});
            }catch(err){
                console.log(err.message);
            }
        })

        // 방 입장(입장시 입장 메시지 전달)
        socket.on("joinRoom",async(rid,cb)=>{
            try{
                const user= await userController.CheckUser(socket.id);
                await roomController.joinRoom(rid,user);

                socket.join(user.room.toString());
                const welcomeMessage={
                    chat:`${user.name} is joined to this room`,
                    user:{id:null,name:`system`},
                };
                io.to(user.room.toString()).emit("message",welcomeMessage);
                //io.emit("rooms",await roomController.getAllRooms());
                cb({ok:true});
            }catch(error){
                cb({ok:false,error:error.message});
            }
        });

        // room List 반환
        socket.emit("rooms",await roomController.getAllRooms());

        // 메시지 전달
        socket.on("sendMessage",async(receivedMessage,roomId,cb)=>{
            try{
               const user=await User.findOne({token:{$in:[socket.id]},rooms:{$in:[roomId]}});
                if(user){
                    const message=await chatController.saveChat(receivedMessage,user);
                    io.to(roomId).emit("message",message);
                    return cb({ok:true});
                }
            }catch(err){
                console.log(err);
                cb({ok:false,error:err.message});
            }
        });

        socket.on("leaveRoom",async(_,cb)=>{
            try{
                const user= await userController.CheckUser(socket.id);
                await roomController.leaveRoom(user);
                const leaveMessage={
                    chat:`${user.name} left this room`,
                    user:{id:null,name:"system"},
                };

                socket.broadcast.to(user.room.toString()).emit("message",leaveMessage);

                io.emit("rooms",await roomController.getAllRooms());
                socket.leave(user.room.toString());
                cb({ok:true});
            }catch(error){
                cb({ok:false,message:error.message});
            }
        });


        socket.on("disconnect",()=>{
            console.log("user is disconnected");
        })
    });
};