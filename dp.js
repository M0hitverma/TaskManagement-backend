const mongoose= require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URL,{
    dbName:process.env.DBNAME
}).then(()=>{
    console.log("Database Connected Successfully");
}).catch((error)=>{
    console.log("Error :",error);
})