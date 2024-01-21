const multer=require("multer");
const fs=require("fs").promises;
const path = require('path');
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,process.env.IMG_PATH)
    },
    filename:async function(req,file,cb){

        const filename=req.userId.userId+path.extname(file.originalname);
        const filePath=path.join(process.env.IMG_PATH,filename);
        req.filename=filename
        try{
            await fs.access(filePath);
            await fs.unlink(filePath);
        }catch(err){
            console.log("file upload error")
        }
        cb(null,filename);
    }
})

const upload = multer({ storage: storage });

const profileImgUpdate=async(req,res,next)=>{
    if(req.body.deleteImg){
        try{
            const filePath=path.join(process.env.IMG_PATH+req.body.deleteImg);
            await fs.unlink(filePath);
            next();
        }catch(err){
            console.log("Error delete Img=",err);
        }
    }else{
        upload.single("file")(req,res,next);
    }

}

module.exports=profileImgUpdate;