const Room = require("../Models/room");
const mongoose = require("mongoose");
const roomController = {};
roomController.getAllRooms = async () => {
    const roomList = Room.find({});
    return roomList;
}

roomController.createRoom = async (members, name) => {
    console.log("name=",name);
    const room = new Room({
        members: members,
        name: name
    })

    await room.save();

    return room._id;
}

roomController.findOneToOneRoom=async(userId1,userId2)=>{
    const room=await Room.findOne({
        members:{
            $all:[userId1,userId2],
            $size:2
        }
    });

    return room;
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

    // return await Room.aggregate([
    //     //userId를 포함하는 members를 가진 데이터
    //     { $match: { members: { $in: [userId] } } },

    //     //roomId로 조인
    //     {
    //         $lookup: {
    //             from: "chats",
    //             localField: "_id",
    //             foreignField: "room",
    //             as: "chats"
    //         }
    //     },
    //     //chats가 배열이 아닌 단일 필드로 만들어짐
    //     //즉 하나의 chats를 가진 room들로 변환
    //     {
    //         $unwind: {
    //             path: "$chats",
    //             preserveNullAndEmptyArrays: true
    //         }
    //     },
    //     { $sort: { "chats.createdAt": -1 } },

    //     //roomId로 다시 그룹화 시킴
    //     //이떄 room은 첫번째 chat만을 가지게 됨
    //     {
    //         $group: {
    //             _id: "$_id",
    //             room: { $first: "$$ROOT" },
    //             chat: { $first: "$chats" }
    //         }
    //     },
    //     {
    //         $sort:{"chat.createdAt":-1}
    //     },
    //     {
    //         $lookup: {
    //             from: "users",
    //             localField: "room.members",
    //             foreignField: "_id",
    //             as: "members"

    //         }
    //     },
        
    //     {
    //         $project: {
    //             "name": { $ifNull: ["$room.name", ""] },
    //             "chat": "$chat.chat",
    //             "members": {
    //                 $filter: {
    //                     input: {
    //                         $map: {
    //                             input: "$members",
    //                             as: "member",
    //                             in: {
    //                                 _id: "$$member._id", 
    //                                 name: "$$member.name",
    //                                 profileImg: "$$member.profileImg",
    //                                 online: "$$member.online"
    //                             }
    //                         }
    //                     },
    //                     as: "member",
    //                     cond: { $ne: ["$$member._id", userId] }
    //                 }
    //             }
    //         }
    //     }


    // ]).exec();
    return Room.aggregate([
        { $match: { members: { $in: [userId] } } },
        {
            $lookup: {
                from: "chats",
                localField: "_id",
                foreignField: "room",
                as: "chats"
            }
        },
        { $unwind: "$chats" },
         { $sort: { "chats.createdAt": -1 } },
        {
            $group: {
                _id: "$_id",
                room: { $first: "$$ROOT" },
                chats: { $push: "$chats" } // 모든 채팅을 chats 배열에 저장
            }
        },
        {
            $project: {
                room: 1,
                chats: { $slice: ["$chats", 10] } // 최근 10개 채팅으로 제한
            }
        },
        {
            $project: {
                room: 1,
                unreadCount: {
                    $size: {
                        $filter: {
                            input: "$chats",
                            as: "chat",
                            cond: { $in: [userId, "$$chat.unreadMembers"] }
                        }
                    }
                },
                chats: 1 // chats 정보를 유지하려면 이 줄을 유지
            }
        },
        // 이전 예제의 나머지 부분을 통합
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
                "name": { $ifNull: ["$room.name", ""] },
                "chat": { $arrayElemAt: ["$chats.chat", 0] }, // 최신 채팅 정보
                "chatCreatedAt": { $arrayElemAt: ["$chats.createdAt", 0] }, // 최신 채팅의 createdAt
                "unreadCount": 1, // unreadCount 추가
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
        },
        { $sort: { "chatCreatedAt": -1 } }
    ]).exec();
}

module.exports = roomController;