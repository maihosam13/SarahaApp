import express from "express";
import chalk from "chalk";
import userRouter, {routes as  userRoutes } from "./modules/User/user.controller.js";
import { DBconnection } from "./DB/DB.connection.js";
import { GenderEnum, ProviderEnum } from "./modules/User/user.types.js";
import { userModel } from "./DB/models/user.model.js";
import { config } from "dotenv";


config({
    path:"./config/.env"
})

const bootstrap = async()=>{
    const app = express()
    const port = 3000
    app.use(express.json())
    
   await  DBconnection()

    app.get('/',async(req,res)=>{
        
   const user =  await userModel.find()
        res.json({
            user
         
        }
    )
    })
    
    app.use(userRoutes.base,userRouter)

//    await userModel.create({
//     fullName:"anas mohamed",
//     email:"anas1@gmail.com",
//     password:"1234",
//     userName:"Anas_mohamed"
//    })

   
    
    
   app.use((err,req,res,next)=>{
    const statusCode =err.cause?.statusCode ||500
    
    
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