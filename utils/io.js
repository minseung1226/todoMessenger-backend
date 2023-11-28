const chatController = require("../Controllers/chat.controller");
const roomController = require("../Controllers/room.controller");
const userController=require("../Controllers/user.controller")

module.exports=function(io){
    //io ~~~~
    io.on("connection",async(socket)=>{
        console.log("client is connected",socket.id);
        
        //로그인
        socket.on("login",async(userName,cb)=>{
            try{
                const user=await userController.saveUser(userName,socket.id);
                
                cb({ok:true,data:user});
            }catch(error){
                cb({ok:false,error:error.message})
            }
        });

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
                io.emit("rooms",await roomController.getAllRooms());
                cb({ok:true});
            }catch(error){
                cb({ok:false,error:error.message});
            }
        });

        // room List 반환
        socket.emit("rooms",await roomController.getAllRooms());

        // 메시지 전달
        socket.on("sendMessage",async(message,cb)=>{
            try{
                const user=await userController.CheckUser(socket.id);
                if(user){
                    const message=await chatController.saveChat(receivedMessage,user);
                    io.to(user.room.toString()).emit("message",message);
                    return cb({ok:true});
                }
            }catch(err){
                cb({ok:false,err:err.message});
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