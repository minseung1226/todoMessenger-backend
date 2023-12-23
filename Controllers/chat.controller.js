const Chat=require("../Models/chat");

const chatController={}

chatController.saveChat=async(message,user,roomId)=>{

    const newMessage=new Chat({
        chat:message,
        user:{
            id:user._id,
            name:user.name,
        },
        room:roomId
        
    });

    await newMessage.save();
    return newMessage;    
}

chatController.findChatsByRoomId=async(roomId)=>{
    const chats=Chat.find({room:roomId})
                    .populate('room')
                    .sort({createdAt:1})
                    .then(chats=>{
                        return chats;
                    })
                    .catch(err=>console.log(err.message));
    return chats;
}

module.exports=chatController;