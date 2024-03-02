const userModel= require('../models/user');
const jwt= require('jsonwebtoken');
require('dotenv').config();



const authenticateUser= async(req,res,next)=>{
     try{
    const token = req.cookies.token;
    if(!token){
       return  res.status(401).json({ok:false, message:'Unauthorized'});
    }
  
    jwt.verify(token,process.env.SECRET_KEY,(error,decode)=>{
          if(error){
            return res.status(400).json({ok: false, message: 'Token is not valid'});
          }
          req.userId=decode.userId;
          next();
    });
}catch(error){
       res.status(500).json({ok:false, message: 'Internal Server Error'});
}

}

module.exports=authenticateUser;