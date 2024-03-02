const mongoose= require('mongoose')
const { softDeletePlugin } = require('soft-delete-plugin-mongoose');
const subtaskSchema= mongoose.Schema({
     task_id: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'taskSchema',
        required:true
     },
     status:{
        type:Number,
        default:0
     },
     created_at:{
        type:Date,
        default:Date.now(),
     },
     updated_at:{
        type:Date
     },
     deleted_at:{
      type:Date
     }

})
subtaskSchema.plugin(softDeletePlugin);
module.exports= mongoose.model('subtaskSchema',subtaskSchema);