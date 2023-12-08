const Room=require("../Models/room");
const roomController={};
roomController.getAllRooms=async()=>{
    const roomList=Room.find({});
    return roomList;
}

roomController.createRoom=async(roomName,members)=>{
    const room=new Room({
        roomName:roomName,
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

module.exports=roomController;