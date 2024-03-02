const express= require('express');
const app= express();
const PORT=8000
const cookieParser =require('cookie-parser');
app.use(cookieParser());
app.use(express.json());
require('./dp');
require('./cron');
const { cronCallbackHandler } = require('./cron');

const authRouter= require('./routes/auth');
const taskRouter= require('./routes/task');

app.use('/auth',authRouter);
app.use('/task',taskRouter);

app.post('/events',cronCallbackHandler);



app.listen(PORT, ()=>{
    console.log('Server connected successfully')
})