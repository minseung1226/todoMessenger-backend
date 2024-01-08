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
        socket.on("userIdJoin",async(token)=>{

            const userId= await getUserIdFromToken(token);
            socket.join(userId);
        })
        
        // 친구 목록 조회
        socket.on("friendList",async(token,cb)=>{
            try{
                const userId=await getUserIdFromToken(token);
                socket.to(userId).emit("aa",{data:"시발"});
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
                
                console.log("roomId="+roomId+" token="+token);
                let userId= await getUserIdFromToken(token);
                const user=await User.findOne({_id:userId});
                const chats=await chatController.findChatsByRoomId(roomId);
                cb({chats:chats,user:user});
            }catch(err){
                cb({err:err});
                console.log(err.message);
            }
        })

        //친구 추가
        socket.on("addFriend",async(token,friendId,cb)=>{
            try{
                const userId=await getUserIdFromToken(token);
                await userController.addFriend(userId,friendId);
                
                const user=await User.findOne({_id:friendId});
                const friend={
                    id:user._id,
                    name:user.name,
                    online:user.online,
                    profileImg:user.profileImg
                }
                console.log("Emitting 'newFriend' event", { newFriend: friend });
                socket.to(userId).emit("newFriend",{newFriend:friend});
                console.log("Emitted 'newFriend' event");
                
                cb({ok:true});
            }catch(err){
                cb({err:err});
                console.log("add friend error");
            }
        })
        socket.on("sendMessage",async(receivedMessage,roomId,token,cb)=>{
            try{
                const userId=await getUserIdFromToken(token);
               const user=await User.findOne({_id:userId});
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

        socket.on("findUser",async(token,cb)=>{
            try{
                const userId=await getUserIdFromToken(token);
                const user = await User.findOne({_id:userId});
                cb({user:user});
            }catch(err){
                cb({err:err});
                console.log("socket find user error");
            }
        })


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