const userModel= require('../models/user');
const bcrypt= require('bcrypt');
const jwt= require('jsonwebtoken');
require('dotenv').config();

const registerHandler =async(req,res)=>{
    const {phone_number,password,priority}= req.body;
    try{
    const user = await userModel.findOne({phone_number});
    if(user){
      res.status(401).json({ok:false, message:'User Already exists'});
    }

    const newUser = userModel({
      phone_number,
      password: await bcrypt.hash(password,parseInt(process.env.BCRYPT_KEY)),
      priority
    });
    await newUser.save();
    res.status(200).json({ok:true, message:'User registered successfully'});
    }catch(error){
        res.status(500).json({ok:false, message:'Internal Server Error'});
    }
}

const signHandler = async(req,res)=>{
      const {phone_number,password}=req.body;
      try{
    const user= await userModel.findOne({phone_number});
    if(!user ||  !await bcrypt.compare(password,user.password)){
       res.status(500).json({ok:false,message: "Invalid Credential"});
    }
    const token = jwt.sign({userId: user._id},process.env.SECRET_KEY,{expiresIn:'10m'});
    res.cookie('token',token,{httpOnly:true});
    res.status(200).json({ok:true, message: 'User Login Successfully'});
    }catch(error){
    res.status(500).json({ok:false, message:"Internal Server Error"});
}
}


module.exports={
    registerHandler,
    signHandler
}