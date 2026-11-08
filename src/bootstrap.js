import express from "express";
import chalk from "chalk";
import userRouter, {routes as  userRoutes } from "./modules/User/user.controller.js";
import { DBconnection } from "./DB/DB.connection.js";
import { GenderEnum, ProviderEnum } from "./modules/User/user.types.js";
import { userModel } from "./DB/models/user.model.js";
import { config } from "dotenv";
import cors from 'cors'
import { sendEmail } from "./utils/email/sendEmail.js";
import { emailTemplate } from "./utils/email/emailTemplate.js";
import {customAlphabet } from "nanoid";
import { redisClient } from "./DB/redis.connect.js";
import messageRouter, { routes as messageRoutes }  from "./modules/message/message.controller.js";

config({
    path:"./config/.env"
})

const bootstrap = async()=>{
    const app = express()
    const port = 3000

    app.use(cors({
        origin:"*"
    }))



    app.use(express.json())
    
   await  DBconnection()

    app.get('/',async(req,res)=>{
        
   const user =  await userModel.find()
        res.json({
            user
         
        }
    )
    })
    
    

    // redisClient.set("test","ahmed")

    // const test = await redisClient.get("test")
    // console.log({test});
    

    app.use("/uploads",express.static("./uploads"))
    app.use(userRoutes.base,userRouter)
    app.use(messageRoutes.base,messageRouter)

//    await userModel.create({
//     fullName:"anas mohamed",
//     email:"anas1@gmail.com",
//     password:"1234",
//     userName:"Anas_mohamed"
//    })

   
    




    
   app.use((err,req,res,next)=>{
    const statusCode =err.cause?.statusCode ||500
    
    console.log({err});
    
    res.status(statusCode).json({
        errMsg:err.message,
        status:statusCode,
        errOption: err.cause?.options
    });

})

    //  console.log(process.env.PORT);
     

    app.listen(port,()=>console.log(chalk.green(`Example app listening on port ${port}!`)));
    
}


export default bootstrap