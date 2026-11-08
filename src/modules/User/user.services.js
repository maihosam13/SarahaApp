
import { userModel } from "../../DB/models/user.model.js";
import { errorRes } from "../../utils/error.handle.js";
import { decodeToken, tokenEnum } from "../../middlewares/auth.middleware.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { compareHash, CreateHash } from "../../utils/security/hash.js";
import { OAuth2Client } from "google-auth-library";
import { ProviderEnum } from "./user.types.js";
import { sendEmail } from "../../utils/email/sendEmail.js";
import { emailTemplate } from "../../utils/email/emailTemplate.js";
import { random } from "../../utils/email/createOtp.js";
import { attemptsBlockedCountKeys, attemptsBlockedKeys, attemptsKeys, confirmEmailKey, resendOtpKey, userPrefixKey, userSessionJwtIdKey, userSessionJwtIdPrefixKey } from "../../utils/redis-services.js";
import { redisClient } from "../../DB/redis.connect.js";
import { error, log } from "node:console";
import { nanoid } from "nanoid";
const googleClient = new OAuth2Client()

const calcBlockSecs = (count)=>{
    const Block_Mins_Arr = [5,15,60,300,1440]
    const index = Math.min(count , Block_Mins_Arr.length)
    return Block_Mins_Arr[index - 1] *60
}


export const signupService = async ({firstName,lastName,email,password,gender,phone,bio,age, userName}) => {

    const isExist = await userModel.findOne({
        $or: [
            { email },
            { userName }
        ]
    });

    if (isExist) {
        errorRes({
            msg: `${isExist.email == email ? "email" : "username"} already exist`,
            statusCode: 400
        });
    }


    const otp = random(6)
    await sendEmail({
        to:email,
        subject:"confirm Email",
        html:emailTemplate({otp,subject:"confirm email",})
    })

    const user = await userModel.create({
        firstName,
        lastName,
        email,
        password:await CreateHash(password),
        gender,
        phone,
        bio,
        age,
        userName,
//    otp: {
//     code: otp,
//     expireIn: Date.now() + 5 * 60 * 1000
// }
});
 const redisKey = confirmEmailKey(user._id)

 await redisClient.set(redisKey, await CreateHash(otp),{
    expiration:{
        type:"EX",
        value: 5 * 60
    }
 })

 await redisClient.set(resendOtpKey(user._id),0,{
    expiration:{
        type:"EX",
        value: 60
    }
 })

await redisClient.incr(attemptsKeys(user._id))
 return {
        data: {
            user
        }
    };
}


export const loginService = async (identifier, password) => {

    const user = await userModel.findOne({
        $or: [
            { email: identifier },
            { userName: identifier }
        ]
    });

    if (!user) {
        errorRes({
            msg: "invalid credentials",
            statusCode: 400
        });
    }
 
    const IsPasswordMatch = await compareHash(password,user.password)
    if (!IsPasswordMatch) {
        errorRes({
            msg: "invalid credentials",
            statusCode: 400
        });
    }

  const jwtid = nanoid();

const accessToken = jwt.sign(
    {
        _id: user._id,
        email: user.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: "30m",
        jwtid
    }
);

const refreshTokenValue = jwt.sign(
    {
        _id: user._id,
        email: user.email,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: "7d",
        jwtid
    }
);

await redisClient.set(
    userSessionJwtIdKey(user._id, jwtid),
    jwtid,
    {
        expiration: {
            type: "EX",
            value: 7 * 24 * 60 * 60
        }
    }
);
    return {
        data: {
            accessToken,
            refreshToken: refreshTokenValue
        }
    };
}

export const refreshToken = async (authorization)=>{
    const {user ,jti} = await decodeToken({authorization,tokenType:tokenEnum.refresh})
    const accessToken = jwt.sign({
        _id:user._id,
        email:user.email
    },process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:"30M",
        jwtid : jti
    })
    return{
        data:{
            accessToken
        }
    }
}



export const googleLogin= async (token)=>{
    const ticket = await googleClient.verifyIdToken({
        idToken:token,
        audience:process.env.CLIENT_ID
    })


    const {email,name,picture} = ticket.getPayload()

    
    let user = await userModel.findOne({email})
     if (user) {
        if (user.provider != ProviderEnum.google){
        errorRes({
            msg:"use your provider"
        })  
     }
    }else{
        user = await userModel.create({
            email,
            fullname:name,
            profileImage:picture,
            provider:ProviderEnum.google,
            confirmedAt:Date.now()

        })
    }

     const accessToken = jwt.sign(
        {
            _id: user._id,
            email: user.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "15Min"
        }
    );

    const refreshTokenValue = jwt.sign(
        {
            _id: user._id,
            email: user.email
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: "7d"
        }
    );


    

    return {
        data:{
            accessToken,
            refreshToken
        }
    }
}

export const resendConfirmEmailOtp = async(email)=>{
    const user = await userModel.findOne({email,confirmedAt:{
        $exists:false
    }})
    if (!user) {
        errorRes({
            msg:"user not sound",
            statusCode:404
        })
    }
    const userId = user._id
    const cannotResend =( await redisClient.get(resendOtpKey(userId))
    || await redisClient.get(attemptsBlockedKeys(userId)))
    if (cannotResend) {
         errorRes({
            msg:"wait shwiaa",
            statusCode:400
        })
        
        
    }
    const attempts = await redisClient.incr(attemptsKeys(user._id))
      if (attempts >= 5) {
            const blockCount = await redisClient.incr(attemptsBlockedCountKeys(user._id))
            await redisClient.set(attemptsBlockedKeys(user._id),0,{
                expiration:{
                    type:"EX",
                    value:calcBlockSecs(blockCount)
                }
            })
            await redisClient.set(attemptsKeys(user._id),0)
        }else{
            await redisClient.set(resendOtpKey(user._id),0,{
            expiration:{
                type:"EX",
                value : 60
            }
        })
        }
        const otp = random(6)
    await sendEmail({
        to:email,
        subject:"confirm Email",
        html:emailTemplate({otp,subject:"confirm email",})
    })
     const redisKey = confirmEmailKey(user._id)
    await redisClient.set(redisKey, await CreateHash(otp),{
    expiration:{
        type:"EX",
        value: 5 * 60
    }
 })
 return {
     data:{

     }
 }
}



export const confirmEmail = async (email,otp)=>{
    const user = await userModel.findOne({
        email,confirmedAt:{
            $exists:false

    }})
    if (!user) {
        errorRes({
            msg:"user not found",
            statusCode:404
        })
        
    }
    


    const hashedOtp= await redisClient.get(confirmEmailKey(user._id))
    if(!otp){
        errorRes({
            msg:"in-valid or expired otp"
        })
    }
    const isBlocked = await redisClient.get(attemptsBlockedKeys(user._id))
    if (isBlocked) {
        const blockedTTL = await redisClient.ttl(attemptsBlockedKeys(user._id))
        errorRes({
            msg:`try again after ${Math.round(blockedTTL / 60)} M`,
            statusCode:400
        })
    }
    const isOtpCorrect = await compareHash(otp,hashedOtp)
    if (!isOtpCorrect) {
        const attempts = await redisClient.incr(attemptsKeys(user._id))
        if (attempts >= 5) {
            const blockCount = await redisClient.incr(attemptsBlockedCountKeys(user._id))
            await redisClient.set(attemptsBlockedKeys(user._id),0,{
                expiration:{
                    type:"EX",
                    value:calcBlockSecs(blockCount)
                }
            })
            await redisClient.set(attemptsKeys(user._id),0)
            errorRes({
            msg:`try again after ${Math.round(blockCount / 60)} M`,
            statusCode:400
            })
        }

    }else{
    user.confirmedAt = Date.now()
    await user.save()
    const userKeys = await redisClient.keys(`${userPrefixKey(user._id)}*`)
    await redisClient.del(userKeys)
    }


    return{
        data:{

        }
    }
}



export const forgetPassSendOtp = async (email)=>{
    const user = await userModel.findOne({email})
   if (!user) { 
    console.log(0);
    
    return 
    
 }
//  if (user.otp.expireIn > Date.now()) 
//     { errorRes({
//          msg: "OTP already sent. Please try again later.", 
//          statusCode: 400 
//         });
//      }


    const otp = random(6)
    user.otp.code = await CreateHash(otp)
    user.otp.expireIn =Date.now() +5 *60*1000
    await user.save()
    await sendEmail({
        to:email,
        subject:"Forget Password",
        html:emailTemplate({
            otp,
            subject:"Forget Password"
        })
    })
    return {
        data:{}
    }

}



export const resetPassword = async(email,otp,password)=>{
    const user = await  userModel.findOne({email})
    if(!user){
        errorRes({
            msg:"user not found",
            statusCode:404
        })
    }
    // const otp = await  redisClient.get(confirmEmailKey(user._id))
  


    // await checkOtp(user,otp)
    user.password = await CreateHash(password)
    await user.save()




    return{
        data:{}
    }
}



// export const checkOtp = async(user,otp)=>{
//      if (!user.otp || user.otp.expireIn < Date.now()) {
//          errorRes({
//             msg:"otp expired",
//             statusCode:404
//         })
//     }
//     if ((!await compareHash (otp,user.otp.code))) {
//         errorRes({
//             msg:"in-valid otp",
//             statusCode:400
//         }) 
//     }
   
// }



export const logout = async(userId,jti)=>{
    const user = await userModel.findById(userId)
    if (!user) {
        errorRes({
            msg:"user not found",
            statusCode:404
        })
        
    }
    const deleteCount = await redisClient.del(userSessionJwtIdKey(userId,jti))
    if (deleteCount < 1) {
        errorRes({
            msg:"already logged out "
        })
    }
    return {
        data:{

        }
    }
}



export const logoutFromAllDevices = async(userId)=>{
    const user = await userModel.findById(userId)
    if (!user) {
        errorRes({
            msg:"user not found",
            statusCode:404
        })
        
    }
    const sessionKey = await redisClient.keys(`${userSessionJwtIdPrefixKey(userId)}:*`)
    const deleteCount = await redisClient.del(sessionKey)
    if (deleteCount < 1) {
        errorRes({
            msg:"already logged out "
        })
    }
    return {
        data:{
            
        }
    }
}