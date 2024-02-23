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

//month의 일별 스케줄 개수
scheduleController.getScheduleCountsForMonth=async(userId,dateString)=>{
    const objectId=new mongoose.Types.ObjectId(userId);
    const date=new Date(dateString);
    const startDate=new Date(date.getFullYear(),date.getMonth(),1);
    const endDate=new Date(date.getFullYear(),date.getMonth()+1,0);

    
    const result=await Schedule.aggregate([
        {
          $match: {
            "user": objectId,
            scheduleDate: {
              $gte: startDate,
              $lte: endDate
            } // dateString의 월과 일치하고 userId와 일치하는 데이터 필터링
          }
        },
        {
          $addFields: {
            // scheduleDate를 'Asia/Seoul' 시간대에 맞게 변환
            localScheduleDate: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$scheduleDate",
                timezone: "Asia/Seoul"
              }
            }
          }
        },
        {
          $group: {
            // 변환된 날짜로 일별 그룹화
            _id: {
              $dateFromString: {
                dateString: "$localScheduleDate",
                timezone: "Asia/Seoul"
              }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { "_id": 1 }
        }
      ]);
      
    return result.reduce((acc,{_id,count})=>{
        const dateKey=_id.toISOString().split("T")[0]; //2024-02-22
        acc[dateKey]=count;
        return acc;
    },{});
}


module.exports=scheduleController;