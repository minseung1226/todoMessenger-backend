const mongoose=require("mongoose");
const Schedule=require("../Models/schedule");

const scheduleController={};

scheduleController.saveSchedule=async(dates,message,user)=>{
    const schedules=dates.map(date=>({
        scheduleDate:new Date(date),
        message,
        user
    }));

    await Schedule.create(schedules);
    
}

module.exports=scheduleController;