
const cron = require('node-cron');
const taskModel= require('./models/task');
const userModel=require('./models/user');


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

var users=[];
var index=0;


const cronCallbackHandler=(req,res)=>{
  const possiblites= ['no-anser', 'busy', 'failer', 'canceled'];

  if(possiblites.indexOf(req.CallStatus)==-1){
     return res.status(200);
  }

    makeCall();

  res.status(200);

}

const makeCall = ()=>{
  if(index >= users.length){
    console.log('All calls made!');
    return ;
  }
 const number= users[index].phone_number;
  index++;
  client.calls.create({
    method: 'GET',
    url: "http://demo.twilio.com/docs/voice.xml",
    // statusCallback: 'https://www.myapp.com/events', <-Need to host the server
    // statusCallbackEvent: ['completed'],
    // statusCallbackMethod: 'POST',
    to: number,
    from: process.env.TWILIO_PHONE_NO,
  })
  .then((call)=>{
     console.log('call initiated');
  })
  .catch((error)=>{
    console.log('Error: ',error);
  });
  
};


cron.schedule('0 10 * * *', async() => {
     const curDate= new Date();

    const tasks =await taskModel.aggregate([
        {
            $match: {
              due_date:{$lt:curDate},
              status: {$in: ["TODO","IN_PROGRESS"]}

            }
        },
        {
            $project: {
              _id: 0,
              user_id: 1
            }
        },
        {
            $group: {
              _id: null,
              user_id:{
                $push:"$user_id"
              }
            }
        }
        
    ]);

     users =await userModel.find({_id : {"$in": tasks[0].user_id}}).sort({priority:1});

    makeCall();
   
});

module.exports= {cronCallbackHandler};