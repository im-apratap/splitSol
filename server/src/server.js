import express from 'express'
import { ENV } from './config/env.js'

const app = express()

app.use("/",(req,res)=>{
    res.send("Working perfectly")
})

app.listen(ENV.PORT,()=>{
    console.log(`Server running on PORT ${ENV.PORT}`);
})