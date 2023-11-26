const Room=require("../Models/room");
const roomController={};
roomController.getAllRooms=async()=>{
    const roomList=Room.find({});
    return roomList;
}

module.exports=roomController;