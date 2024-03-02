const express= require('express');
const router = express.Router();
const {
    registerHandler,
    signHandler
} = require('../controllers/userHandler');

router.post('/register',registerHandler);
router.post('/signin',signHandler);

module.exports=router;