const express = require('express');
const router = express.Router();
const authenticateUser= require('../middleware/authentication');
const {addTaskHandler,addSubtaskHandler,getAllTasks,getAllSubtask,updateTaskHandler,updateSubtaskHandler,deleteTaskHandler,deleteSubtaskHandler}=require('../controllers/taskHandler');


router.post('/',authenticateUser,addTaskHandler);

router.post('/subtask',authenticateUser,addSubtaskHandler);


router.get('/',getAllTasks);

router.get('/subtask',getAllSubtask);


router.patch('/:id',authenticateUser,updateTaskHandler);

router.patch('/subtask/:id',authenticateUser, updateSubtaskHandler);


router.delete('/:id',authenticateUser, deleteTaskHandler);
router.delete('/subtask/:id',authenticateUser, deleteSubtaskHandler);

module.exports=router;