const mongoose =require('mongoose');
const { softDeletePlugin } = require('soft-delete-plugin-mongoose');
const taskSchema = mongoose.Schema({
    title:{
        type:String,
        require:true
    },
    description:{
        type:String,
    },
    due_date:{
        type:Date,
        require:true
    },
    status:{
       type: String,
       default:'DONE'
    },
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'userModel'
    },
    priority:{
        type:Number,
    }
})

taskSchema.plugin(softDeletePlugin);
module.exports=mongoose.model('taskSchema',taskSchema);