import jwt from 'jsonwebtoken';
import {userModel} from '../DB/models/user.model.js'
import {errorRes} from '../../src/utils/error.handle.js'

export const tokenEnum = {
    access:"access",
    refresh:"refresh"
}

export const auth = async (req, res,next) => {
   const {user} = await decodeToken({authorization:req.headers.authorization})

    req.user = user
    next()
}


export const decodeToken = async({authorization, tokenType = tokenEnum.access})=>{
     
    console.log({ authorization });
    if (!authorization || !authorization.startsWith("Bearer ")) {
        errorRes({
            msg: "in-valid token",
            statusCode: 401
        });
    }
    const token = authorization.split(" ")[1];

    console.log({ token });

    const payload = jwt.verify(token,
         tokenType == tokenEnum.access?
         process.env.ACCESS_TOKEN_SECRET :
         process.env.REFRESH_TOKEN_SECRET 
        );
    console.log({ payload });
    const user = await userModel.findById(payload._id);
    console.log({ user });
    if (!user) {
        errorRes({
            msg: "user not found",
            statusCode: 404
        });
    }


    if (!user.confirmedAt) {
        errorRes({
            msg:"confirm first",
            statusCode:401
        })
        
    }
    return{
        user
    }
}




export const authorization =(...roles)=>{
    return (req,res,next)=>{
        console.log({roles,userRole:req.user.role});
        
        if (!roles.includes(req.user.role)) {
            errorRes({
                msg:"unAuthorization",
                statusCode:401
            })
            
        }
        
        next()
    }
    
}








