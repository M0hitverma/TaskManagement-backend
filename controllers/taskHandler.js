const taskModel= require('../models/task');
const subtaskModel= require('../models/subtask');
const { response } = require('express');


// Helper funciton <--
const updateTaskPriority=async(taskId)=>{
  try{
     const task  = await taskModel.findById(taskId);
     if(task.status=='DONE'){
        task.priority=4;
     }
     else{
      
       const curDate= new Date();
        
       const dueDate=task.due_date;
       
        curDate.setHours(0,0,0,0);
        dueDate.setHours(0,0,0,0);

       

        const differenceInMs = dueDate.getTime() - curDate.getTime();
        const differenceInDays = Math.round(differenceInMs / (1000*60*60*24));
        if(differenceInDays<=0){
            task.priority=0;
        }else if(differenceInDays<=2){
          task.priority=1;
        }else if(differenceInDays<=4){
          task.priority=2;
        }else{
          task.priority=4;
        }
         
     }
     await task.save();
    }catch(error){
      console.log(error);
    }

}
const updateTaskStatus=async(taskId)=>{
  try{
   const data =await subtaskModel.aggregate([
     {
          $match:{
            task_id: taskId
          }

     },
     {
            $group:{
                _id: "$task_id",
                total: {
                    $count:{}
                },
                completed:{
                   $sum: "$status"
                }
            }
     }
   ]);
   const task= await taskModel.findById(taskId);

    if(data[0].total==data[0].completed){
         task.status="DONE";
    }else if(data[0].completed===0){
         task.status="TODO";
    }else{
         task.status="IN_PROGRESS";
    }
     await task.save();
     updateTaskPriority(taskId);

  }catch(error){
    console.log('Error',error);
  }
}
const updateSubtaskStatus=async(taskId,val)=>{
     try{
      await subtaskModel.updateMany({task_id:taskId},{$set:{status:val}});
     }catch(error){
      console.log('Error:',error);
     }
}



// --> HTTP Controllers
const addTaskHandler = async(req,res)=>{
   
   const {title, description,due_date}= req.body;
   try{
   const newTask= taskModel({
    title,
    description,
    due_date,
    user_id: req.userId,
   });
   await newTask.save();
   
   res.status(200).json({ok:true,message:'Task added Successfully'});
}catch(error){
    res.status(500).json({ok:false,message:'Invalid Request'});
}
      
}
const addSubtaskHandler= async(req,res)=>{
    try{
     const task_id =req.body.task_id;
     const newSubtask = subtaskModel({
        task_id,
     });
     await newSubtask.save();
     updateTaskStatus(newSubtask.task_id);
    

    res.status(200).json({ok: true, message:'Subtask added Successfully'});
    }catch(error){
        res.status(500).json({ok:false, message:'Invalid Request'});
    }
}
const getAllTasks=async(req,res)=>{
    try{

         const {priority , due_date, page_no=1 , page_size=10 }= req.query;
 
         let tasks;
         if(priority && due_date){
            tasks= await taskModel.find({
                 priority: priority,
                 due_date: { $lte: new Date(due_date)}}).
                 skip((page_no-1)*page_size).limit(page_size);
         }else if(priority){
             tasks= await (await taskModel.find({priority})).at((page_no-1)*page_size).limit(page_size);
         }else if(due_date){
            tasks=await taskModel.find({ due_date : 
                {  $lte:new Date(due_date)}}).skip((page_no-1)*page_size).limit(page_size);
         }else{
          
            tasks= await taskModel.find().skip((page_no-1)*page_size).limit(page_size);
         }
       
        res.status(200).json({ok:true, message:'Succes', data: tasks});

    }catch(error){
      res.status(500).json({ok:false, message:'Invalid Request'});
    }
}
const getAllSubtask=async(req,res)=>{
    try{
        const task_id=req.query.task_id;
        let subtasks;
        if(task_id){
           subtasks= await subtaskModel.find({task_id});
        }else{
        subtasks= await subtaskModel.find();
        }
        res.status(200).json({ok:true, message:'Success',data: subtasks});
    }catch(error){
        res.status(500).json({ok:false, message:'Invalid Request' });
    }
}

const updateTaskHandler=async(req,res)=>{
         try{

            const taskId= req.params.id;
            let task =await taskModel.findById(taskId);

            if(task.user_id!=req.userId){
              return res.status(500).json({ok:false, message:'Unauthorized Access'});
            }

            const {due_date,status}= req.body;
            if( due_date &&  due_date!=task.due_data){
                 task.due_data=due_date;
            }
            
            if(status && status!=task.status){

                 task.status=status;
                 if(status=='TODO'){
                 updateSubtaskStatus(task._id,0);
                 }
                 else{
                  updateSubtaskStatus(task._id,1);
                 }
            }
            await task.save();
            updateTaskPriority(task._id);
            res.status(200).json({ok:true, message: 'Update Successfully'});

         }catch(error){
             res.status(500).json({ok:false, message: 'Internal Server Error'});
         }
}
const updateSubtaskHandler = async(req,res)=>{
      try{
        const subtask = await subtaskModel.findById(req.params.id);
       
        if(!subtask){
           return res.status(400).json({ok:false, message:'Subtask doesnot exist'});
        }
        console.log(subtask);
        subtask.status= req.body.status;
        subtask.updated_at=new Date();
        await subtask.save();

        updateTaskStatus(subtask.task_id);
        
        res.status(200).json({ok:true, message:"Subtask updated successfully"});


      }catch{
        res.status(500).json({ok:false, message:"Internal Server Error"});
      }
}

const deleteTaskHandler = async(req,res)=>{
   try{
     const task = await taskModel.find({_id: req.params.id});

     if( task.length==0){
        return res.status(400).json({ok:false, message: 'Task does not exist'});
     }
     await taskModel.softDelete({_id: req.params.id});
 
   await subtaskModel.softDelete({task_id:req.params.id});
   res.status(200).json({ok:true, message:"Successfully Deleted"});
   }catch(error){
       res.status(500).json({ok:false, message:'Internal Server Error'});
   }
}
const deleteSubtaskHandler= async(req,res)=>{
     
    try{
        const subtask= await subtaskModel.find({_id: req.params.id});
       
        if(subtask.length==0){
            return res.status(400).json({ok:false, message:'Subtask does not exist'});
        }
        const taskId= subtask.task_id;
        subtask[0].deleted_at=new Date();
        console.log(subtask);
        await subtask[0].save();
        
    await subtaskModel.softDelete({_id: req.params.id});

    updateTaskStatus(taskId);
   
    res.status(200).json({ok: true, message:'Successfully deleted'});

    }catch(error){
          res.status(500).json({ok:false, message:'Internal Server Error'});
    }
}

module.exports={addTaskHandler, addSubtaskHandler,getAllTasks,getAllSubtask,updateTaskHandler,updateSubtaskHandler,deleteSubtaskHandler,deleteTaskHandler};