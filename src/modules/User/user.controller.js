import{Router} from "express";
import {successRes}from "../../utils/success.res.js"
import {errorRes} from '../../utils/error.handle.js'
import { signupService, loginService ,refreshToken} from "./user.services.js";
import jwt, { decode } from "jsonwebtoken";
import { userModel } from "../../DB/models/user.model.js";
import { auth, authorization, tokenEnum } from "../../middlewares/auth.middleware.js";
import { decodeToken } from "../../middlewares/auth.middleware.js";
import { RoleEnum } from "./user.types.js";
import { signupSchema } from "./user.validation.js";
import z from 'zod'
import { validation } from "../../middlewares/validation.middleware.js";
const router = Router()

export const routes={
    base:"/users",
    signup:"/signup",
    login:"/login",    //post
    me:"/me",
    refreshToken:"/refresh-token"
}



router.post(routes.signup,validation(signupSchema),async(req,res)=>{
 

    const {data} = await signupService(req.body)
    
    return successRes({
        res,
        status:201,
        msg:"created"
    })
}
)


router.post(routes.login,async(req,res)=>{
    const {identifier,password} =req.body
    const {data } = await loginService(identifier,password)
    return successRes({res,data})

})





router.get(routes.hello,(req,res,next)=>{

    errorRes({msg:"error from hello api",statusCode:400})
    successRes({res, msg:"user Module"})
})


router.get(routes.me,auth,authorization(RoleEnum.user,RoleEnum.admin),async(req,res)=>{
        const user = req.user
        successRes({res,data:{user}})

    return successRes({
        res,
        data: { user }
    });
});

   

router.post(routes.refreshToken,auth,async(req,res)=>{
    const authorization = req.headers.authorization
    const {data} = await refreshToken(authorization)
    return successRes({
        res,
        data
    })
    

    

    

})

export default router



