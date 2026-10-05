
import { userModel } from "../../DB/models/user.model.js";
import { errorRes } from "../../utils/error.handle.js";
import { tokenEnum } from "../../middlewares/auth.middleware.js";
import jwt from "jsonwebtoken";

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

    const user = await userModel.create({firstName,lastName,email,password,gender,phone,bio,age, userName});

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

    if (user.password != password) {
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

