import{Router} from "express";
import {successRes}from "../../utils/success.res.js"
import {errorRes} from '../../utils/error.handle.js'
import {
    signupService,
    loginService,
    refreshToken,
    googleLogin,
    confirmEmail,
    forgetPassSendOtp,
    resetPassword,
    resendConfirmEmailOtp,
    logoutFromAllDevices
} from "./user.services.js";
import jwt, { decode } from "jsonwebtoken";
import { userModel } from "../../DB/models/user.model.js";
import { auth, authorization, tokenEnum } from "../../middlewares/auth.middleware.js";
import { decodeToken } from "../../middlewares/auth.middleware.js";
import { RoleEnum } from "./user.types.js";
import { resetPasswordSchema, signupSchema } from "./user.validation.js";
import z from 'zod'
import { validation } from "../../middlewares/validation.middleware.js";
import multer from "multer";
import { uploadFile } from "../../utils/multer.js";
const router = Router()

export const routes={
    base:"/users",
    signup:"/signup",
    login:"/login",    //post
    me:"/me",
    refreshToken:"/refresh-token",
    doodleSignup:"/signup/gmail",
    confirmEmail:"/confirm-email",
    forgetPass:"/forget-password",
    resetPassword:"/reset-password",
    uploadFile:"/upload-file",
    resendConfirmEmailOtp :"/resend-confirm-otp",
    logoutFromAllDevices:"/logout-from-all-devices",
    logoutFromOneDevice:"/logout-from-one-device",

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


router.get(routes.me,auth,async(req,res)=>{
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



router.post(routes.googleSignup,async(req,res)=>{
    const {data} = await googleLogin(req.body.idToken)
    successRes({res, data})
    
})




router.patch(routes.confirmEmail,async(req,res)=>{
    const {email,otp} = req.body
    const {data} = await confirmEmail(email,otp)
    successRes({
        res,
        data
    })
})






router.patch(routes.forgetPass, async(req,res)=>{
    const {email} = req.body

    await forgetPassSendOtp(email)

    return successRes({
        res,
        msg:"otp sent to email if exist"
    })
})

// router.patch("/check-email",async(req,res)=>{
//     const{email,otp} = req.body
// })


router.patch(routes.resetPassword,validation(resetPasswordSchema),async(req,res)=>{
    const{email,otp,password} = req.body
    await resetPassword(email,otp,password)

    successRes({res})
})



router.get(routes.uploadFile,auth,uploadFile("users").single("image"),async(req,res)=>{
   
    console.log({
       body:req.body,
       files:req.file
    });
    req.user.profileImage = req.file.path
    await req.user.save()
    






    successRes({res})
})


router.post(routes.resendConfirmEmailOtp,async(req,res)=>{
    const {email} = req.body
    const {data} = await resendConfirmEmailOtp(email)

    successRes({res , data})
})

router.post(routes.logoutFromOneDevice,auth,async(req,res)=>{
    const userId = req.user._id
    const jti = req.jti
    await logoutFromOneDevice(userId,jti)
    return successRes({
        res
    })
})

router.post(routes.logoutFromAllDevices,auth,async(req,res)=>{
    const userId = req.user._id
    await logoutFromAllDevices(userId)
    return successRes({
        res
    })
})


export default router



