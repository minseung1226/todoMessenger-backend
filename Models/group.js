const mongoose=require("mongoose");

const groupSchema=new mongoose.Schema(
    {
        name:String,
        parentGroupId:{type:mongoose.Schema.ObjectId,ref:"Group"},
        members:[{type:mongoose.Schema.ObjectId,ref:"User"}],
        admin:{type:mongoose.Schema.ObjectId,ref:"User"},
        
    },
    {timestamps:true}
)

model.export=mongoose.model("Group",groupSchema);