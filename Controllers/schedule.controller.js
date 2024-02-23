const mongoose=require("mongoose");
const Schedule=require("../Models/schedule");

const scheduleController={};

scheduleController.saveSchedule=async(dates,message,userId)=>{
    const objectId=new mongoose.Types.ObjectId(userId);
    const schedules=dates.map(date=>({
        scheduleDate:new Date(date),
        message,
        user:objectId
        ,
        success:false
    }));

    await Schedule.create(schedules);
    
}

scheduleController.findSchedule=async(userId,date)=>{
    const startDate=new Date(date);
    startDate.setHours(0,0,0,0);

    const endDate=new Date(date);
    endDate.setHours(23,59,59,999);
    const objectId=new mongoose.Types.ObjectId(userId);

    try{
        return await Schedule.find({
            user:objectId,
            scheduleDate:{
                $gte:startDate,
                $lte:endDate,
            }

        });
    }catch(err){
        console.log("find schedule error");
        throw err;
    }
}

scheduleController.changeSchedule=async(scheduleId)=>{
    const schedule=await Schedule.findOne({_id:scheduleId});
    schedule.success=!schedule.success;
    await schedule.save();
}


module.exports=scheduleController;