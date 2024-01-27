const Room = require("../Models/room");
const mongoose = require("mongoose");
const roomController = {};
roomController.getAllRooms = async () => {
    const roomList = Room.find({});
    return roomList;
}

roomController.createRoom = async (members, name) => {

    const room = new Room({
        members: members,
        roomName: name
    })

    await room.save();


    return room._id;
}

roomController.joinRoom = async (roomId, user) => {
    const room = await Room.findById(roomId);
    if (!room) {
        throw new Error("방이 존재하지 않다.")
    }
    if (!room.members.includes(user._id)) {
        room.members.push(user._id);
        await room.save();
    }
    user.room = roomId;
    await user.save();
}

roomController.leaveRoom = async (roomId,userId) => {
    await Room.updateOne(
        {_id:roomId},
        {$pull:{members:userId}}
    );
    }

// return =>room(room의 data,user(userId의 데이터 제외),chat)
roomController.findAllRoom = async (strUserId) => {
    const userId = new mongoose.Types.ObjectId(strUserId);

    return await Room.aggregate([
        //userId를 포함하는 members를 가진 데이터
        { $match: { members: { $in: [userId] } } },

        //roomId로 조인
        {
            $lookup: {
                from: "chats",
                localField: "_id",
                foreignField: "room",
                as: "chats"
            }
        },
        //chats가 배열이 아닌 단일 필드로 만들어짐
        //즉 하나의 chats를 가진 room들로 변환
        {
            $unwind: {
                path: "$chats",
                preserveNullAndEmptyArrays: true
            }
        },
        { $sort: { "chats.createdAt": -1 } },

        //roomId로 다시 그룹화 시킴
        //이떄 room은 첫번째 chat만을 가지게 됨
        {
            $group: {
                _id: "$_id",
                room: { $first: "$$ROOT" },
                chat: { $first: "$chats" }
            }
        },
        {
            $sort:{"chats.createAt":-1}
        },
        {
            $lookup: {
                from: "users",
                localField: "room.members",
                foreignField: "_id",
                as: "members"

            }
        },
        
        {
            $project: {
                "roomName": { $ifNull: ["$room.roomName", ""] },
                "chat": "$chat.chat",
                "members": {
                    $filter: {
                        input: {
                            $map: {
                                input: "$members",
                                as: "member",
                                in: {
                                    _id: "$$member._id", 
                                    name: "$$member.name",
                                    profileImg: "$$member.profileImg",
                                    online: "$$member.online"
                                }
                            }
                        },
                        as: "member",
                        cond: { $ne: ["$$member._id", userId] }
                    }
                }
            }
        }


    ]).exec();
}

module.exports = roomController;