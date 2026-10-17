
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


const googleClient = new OAuth2Client()
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
   otp: {
    code: otp,
    expireIn: Date.now() + 5 * 60 * 1000
}});

    return {
        data: {
            user
        }
    };
};


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
        data: {
            accessToken,
            refreshToken: refreshTokenValue
        }
    };
};

export const refreshToken = async (authorization)=>{
    const {user} = await decodeToken({authorization,tokenType:tokenEnum.refresh})
    const accessToken = jwt.sign({
        _id:user._id,
        email:user.email
    },process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:"30M"
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
    

    await checkOtp(user,otp)
    user.confirmedAt = Date.now()
    await user.save()
    return{
        data:{

        }
    }
}



export const forgetPassSendOtp = async (email)=>{
    const user = await userModel.findOne({email})
   if (!user) { 
    return 
    { };
 } if (user.otp?.expireIn > Date.now()) 
    { errorRes({
         msg: "OTP already sent. Please try again later.", 
         statusCode: 400 
        });
     }


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
  


    await checkOtp(user,otp)
    user.password = await CreateHash(password)
    await user.save()




    return{
        data:{}
    }
}




export const checkOtp = async(user,otp)=>{
    if (!user.otp || user.otp.expireIn < Date.now()) {
         errorRes({
            msg:"otp expired",
            statusCode:404
        })
    }
    if ((!await compareHash (otp,user.otp.code))) {
        errorRes({
            msg:"in-valid otp",
            statusCode:400
        }) 
    }
}