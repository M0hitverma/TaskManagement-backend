const mongoose= require('mongoose');
const userSchema= mongoose.Schema({
     phone_number:{
         type: String,
         required: true,
     },
     password:{
        type:String,
        required: true
     },
     priority:{
        type: Number
     },

});
module.exports= mongoose.model('userModel',userSchema);