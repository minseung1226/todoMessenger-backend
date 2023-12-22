const Room=require("../Models/room");
const roomController={};
roomController.getAllRooms=async()=>{
    const roomList=Room.find({});
    return roomList;
}

roomController.createRoom=async(members)=>{

    const room=new Room({
        members:members,
    })

    await room.save();


    return room._id;
}

roomController.joinRoom=async(roomId,user)=>{
    const room=await Room.findById(roomId);
    if(!room){
        throw new Error("방이 존재하지 않다.")
    }
    if(!room.members.includes(user._id)){
        room.members.push(user._id);
        await room.save();
    }
    user.room=roomId;
    await user.save();
}

roomController.leaveRoom=async(user)=>{
    const room=await Room.findById(user.room);
    if(!room){
        throw new Error("방 못찾음");
    }

    room.members.remove(user._id);
    await room.save();
}

// return =>room(room의 data,user(userId의 데이터 제외),chat)
roomController.findAllRoom=async(userId)=>{
    Room.aggregate([
        //userId를 포함하는 members를 가진 데이터
        {$match:{members:{$in:[userId]}}},

        //roomId로 조인
        {
            $lookup:{
                from:"chats",
                localField:"_id",
                foreignField:"roomId",
                as:"chats"
            }
        },
        //chats가 배열이 아닌 단일 필드로 만들어짐
        //즉 하나의 chats를 가진 room들로 변환
        {$unwind:{
            path:"$chats",
            preserveNullAndEmptyArrays:true
        }},
        {$sort:{"chats.createAt":-1}},

        //roomId로 다시 그룹화 시킴
        //이떄 room은 첫번째 chat만을 가지게 됨
        {
            $group:{
                _id:"$_id",
                room:{$first:"$$ROOT"},
                chat:{$first:"$chats"}
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"room.members",
                foreignField:"_id",
                as:"members"

            }
        },
        {
            $project:{
                "room.name":1,
                "chat":1,
                "members":{
                    $filter:{
                        input:"$members",
                        as:"member",
                        cond:{$ne:["$$member._id",userId]}
                    }
                }
            }
        }


    ]).exec();
}

module.exports=roomController;