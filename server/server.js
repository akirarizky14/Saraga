const express = require('express');
const app = express();
const mongoose = require('mongoose');
const userRoutes = require('./routers/userRouter')
const cors = require('cors');
app.use(cors({ origin: ['http://localhost:3000'] }));

require('dotenv').config()
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;
app.use(express.json());

app.use('/api', userRoutes);

mongoose.connect(MONGO_URL)
    .then(() =>{
        app.listen(PORT,()=>{
            console.log(`listening in port ${PORT}`)
        })
    })
    .catch((error)=>{
        console.log(error)
    })