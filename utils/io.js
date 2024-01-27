const chatController = require("../Controllers/chat.controller");
const roomController = require("../Controllers/room.controller");
const userController = require("../Controllers/user.controller")
const jwt = require("jsonwebtoken");
const User = require("../Models/user");
const Room = require("../Models/room");
const { default: mongoose } = require("mongoose");
// JWT TOKEN userId로 변환
function getUserIdFromToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(data.userId);
            }
        })
    });
}
module.exports = function (io) {
    //io ~~~~
    io.on("connection", async (socket) => {
        console.log("connect")
        socket.on("userIdJoin", async (token) => {

            const userId = await getUserIdFromToken(token);
            socket.join(userId);

        })

        // 친구 목록 조회
        socket.on("friendList", async (token, cb) => {
            try {
                const userId = await getUserIdFromToken(token);
                const friendList = await userController.findFriends(userId);

                cb({ friendList: friendList });
            } catch (err) {
                console.log("friendList inquiry error");
                cb({ err: err });
                throw err;
            }
        })

        //채팅방 목록 조회
        socket.on("roomList", async (token, cb) => {
            try {
                const userId = await getUserIdFromToken(token);
                const chatRoomListInfo = await roomController.findAllRoom(userId);
                chatRoomListInfo.forEach(room => {
                    socket.join(room._id.toString());
                })

                console.log("rooms=",chatRoomListInfo);
                cb({ chatRoomListInfo: chatRoomListInfo });
            } catch (err) {
                console.log("roomList inquiry err");
            }
        })



        // 채팅방 목록 조회
        socket.on("getAllChatsAndUser", async (roomId, token, cb) => {
            try {
                const roomName = await Room.findOne({ _id: roomId }, { roomName: 1, _id: 0 });
                let userId = await getUserIdFromToken(token);
                const user = await User.findOne({ _id: userId });
                const chats = await chatController.findChatsByRoomId(roomId);
                cb({ chats: chats, user: user, roomName: roomName });
            } catch (err) {
                cb({ err: err });
                console.log(err.message);
            }
        })

        //채팅방 생성
        socket.on("createChatRoom", async (token, selectFriendIds, cb) => {
            try {
                const userId = await getUserIdFromToken(token);
                selectFriendIds.push(userId);
                const users = await User.find({ _id: selectFriendIds });
                const userNames = users.map(user => user.name).join(","); // 방이름 (이름1,이름2,이름3) 생성
                const roomId = await roomController.createRoom(selectFriendIds, userNames);

                const room = await Room.findOne({ _id: roomId });
                selectFriendIds.forEach(friendId => {
                    io.to(friendId).emit("refreshRoomList");
                })
                cb({ ok: true, roomId: roomId });
            } catch (err) {
                console.log("createChatRoom error");
                throw error;
            }
        })


        //친구 추가
        socket.on("addFriend", async (token, friendId, cb) => {
            try {
                const userId = await getUserIdFromToken(token);
                await userController.addFriend(userId, friendId);

                const user = await User.findOne({ _id: friendId });
                const friend = {
                    id: user._id,
                    name: user.name,
                    online: user.online,
                    profileImg: user.profileImg
                }
                socket.to(userId).emit("newFriend", { newFriend: friend });


                cb({ ok: true });
            } catch (err) {
                cb({ err: err });
                console.log("add friend error");
            }
        })
        socket.on("sendMessage", async (receivedMessage, roomId, token, cb) => {
            try {
                const userId = await getUserIdFromToken(token);
                const user = await User.findOne({ _id: userId });
                if (user) {
                    const message = await chatController.saveChat(receivedMessage, user, roomId);
                    socket.join(roomId);
                    io.to(roomId).emit("message", message);
                    io.to(roomId).emit("refreshRoomList");
                    return cb({ ok: true });
                }
            } catch (err) {
                console.log(err);
                cb({ ok: false, error: err.message });
            }
        });

        socket.on("findUser", async (token, cb) => {
            try {

                const userId = await getUserIdFromToken(token);
                const user = await User.findOne({ _id: userId });

                cb({ user: user });
            } catch (err) {
                cb({ err: err });
                console.log("socket find user error");
            }
        })

        socket.on("refreshUser", async (token) => {
            const userId = await getUserIdFromToken(token);

            io.to(userId).emit("refreshUser");
        })

        socket.on("changePassword", async (token, password, cb) => {
            try {

                const userId = await getUserIdFromToken(token);
                await userController.updatePassword(userId, password);
                cb({ ok: true })
            } catch (err) {
                console.log("password change error");
                cb({ err: err });
            }
        })

        //메시지 알림 데이터 조회
        socket.on("alertMessage", async (chatId, cb) => {
            const alertMessage = await chatController.findAlertChat(chatId);

            cb({ chat: alertMessage });
        })

        socket.on("leaveRoom", async (token, roomId, cb) => {
            try {
                const userId = await getUserIdFromToken(token);
                await roomController.leaveRoom(roomId, userId);

                io.to(userId).emit("refreshRoomList");
                cb({ ok: ok });
            } catch (err) {
                console.log("leave room error");
                console.log("Err=", err);
                cb({ err: err });
            }
        })



        socket.on("disconnect", () => {
            console.log("user is disconnected");
        })
    });



    function makeSystemUser(roomId) {
        const system = {
            id: null,
            name: "system",
            room: roomId
        }
        return system;
    }
};