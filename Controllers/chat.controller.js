const { default: mongoose } = require("mongoose");
const Chat = require("../Models/chat");

const chatController = {}

chatController.readChats=async(roomId,userId)=>{

    try{
        await Chat.updateMany(
            {room:roomId,unreadMembers:userId},
            {$pull:{unreadMembers:userId}}
        );
    }catch(err){
        console.log("readChats err");
        throw err;
    }
}
chatController.saveChat = async (message, user, roomId,members) => {

    const newMessage = new Chat({
        chat: message,
        user: {
            id: user._id,
            name: user.name,
        },
        room: roomId,
        unreadMembers:members

    });

    await newMessage.save();
    return newMessage;
}

chatController.findAlertChat = async (chatId) => {
    const objectId = new mongoose.Types.ObjectId(chatId);

    return Chat.findOne({ _id: objectId })
        .populate(
            {
                path: "room",
                select: "_id name",
                populate: {
                    path: "members",
                    select: "profileImg",
                    options: { limit: 4 }
                }
            }
        )
        .select("_id chat room");

}
chatController.findChatsByRoomId = async (roomId) => {
    const chats = Chat.find({ room: roomId })
        .populate({
            path:"user",
            select:"name profileImg"
        })
        .select("_id chat createdAt unreadMembers")
        .sort({ createdAt: 1 })
        .then(chats => {
            return chats;
        })
        .catch(err => console.log(err.message));
    return chats;
}

module.exports = chatController;
