const chatController = require("../Controllers/chat.controller");
const roomController = require("../Controllers/room.controller");
const userController=require("../Controllers/user.controller")
const jwt=require("jsonwebtoken");
const User=require("../Models/user");

// JWT TOKEN userId로 변환
function getUserIdFromToken(token){
    return new Promise((resolve,reject)=>{
        jwt.verify(token,process.env.JWT_SECRET_KEY,(err,data)=>{
            if(err){
                reject(err);
            }
            else{
                resolve(data.userId);
            }
        })
    });
}
module.exports=function(io){    
    //io ~~~~
    io.on("connection",async(socket)=>{
        
        socket.on("saveSocketId",async(token,cb)=>{

            let userId=await getUserIdFromToken(token);

            await userController.changeSocketId(socket.id,userId);

            const u=await User.findOne({_id:userId});

            cb({ok:true});

        });
        
        // 친구 목록 조회
        socket.on("friendList",async(token,cb)=>{
            try{
                const userId=await getUserIdFromToken(token);
                const friendList=await userController.findFriends(userId);
                cb({friendList:friendList});
            }catch(err){
                console.log("friendList inquiry error");
                cb({err:err});
                throw err;
            }
        })

        //채팅방 목록 조회
        socket.on("roomList",async(token,cb)=>{
            try{
                const userId=await getUserIdFromToken(token);
                const chatRoomListInfo=await roomController.findAllRoom(userId);

                cb({chatRoomListInfo:chatRoomListInfo});
            }catch(err){
                console.log("roomList inquiry err");
            }
        })



        // 채팅방 목록 조회
        socket.on("getAllChatsAndUser",async(roomId,token,cb)=>{
            try{

                let userId= await getUserIdFromToken(token);
                const user=await User.findOne({_id:userId});
                const chats=await chatController.findChatsByRoomId(roomId);
                cb({chats:chats,user:user});
            }catch(err){
                cb({err:err});
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
              
                cb({ok:true});
            }catch(error){
                cb({ok:false,error:error.message});
            }
        });


        socket.on("sendMessage",async(receivedMessage,roomId,cb)=>{
            try{

               const user=await User.findOne({socketId:socket.id});
                if(user){
                    const message=await chatController.saveChat(receivedMessage,user,roomId);
                    socket.join(roomId);
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


    function makeSystemUser(roomId){
        const system={
            id:null,
            name:"system",
            room:roomId
        }
        return system;
    }
};