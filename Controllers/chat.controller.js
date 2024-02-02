const { default: mongoose } = require("mongoose");
const Chat = require("../Models/chat");

const chatController = {}

chatController.saveChat = async (message, user, roomId) => {

    const newMessage = new Chat({
        chat: message,
        user: {
            id: user._id,
            name: user.name,
        },
        room: roomId

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
                select: "_id roomName",
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
            select:"name"
        })
        .select("_id chat createAt")
        .sort({ createdAt: 1 })
        .then(chats => {
            return chats;
        })
        .catch(err => console.log(err.message));
    return chats;
}

module.exports = chatController;