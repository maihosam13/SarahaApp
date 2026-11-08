import jwt from 'jsonwebtoken';
import {userModel} from '../DB/models/user.model.js'
import {errorRes} from '../../src/utils/error.handle.js'
import { redisClient } from '../DB/redis.connect.js';
import { userSessionJwtIdKey } from '../utils/redis-services.js';
import { UserRefreshClient } from 'google-auth-library';

export const tokenEnum = {
    access:"access",
    refresh:"refresh"
}

export const auth = async (req, res,next) => {
   const {user,jti} = await decodeToken({authorization:req.headers.authorization})

    req.user = user
    req.jti = jti
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
     const { jti } = payload;

    if (!jti) {
        errorRes({
            msg: "in-valid token",
            statusCode: 400
        });
    }

    const redisJti = await redisClient.get(
        userSessionJwtIdKey(user._id, jti)
    );

    if (!redisJti) {
        errorRes({
            msg: "logged out log again",
            statusCode: 400
        });
    }

    return {
        user,
        jti
    };
};

export const authorization = (...roles) => {
    return (req, res, next) => {

        if (!roles.includes(req.user.role)) {
            errorRes({
                msg: "unAuthorization",
                statusCode: 401
            });
        }

        next();
    }
}