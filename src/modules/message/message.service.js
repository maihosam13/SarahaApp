import { messageModel } from "../../DB/models/message.model"
import { userModel } from "../../DB/models/user.model"
import { errorRes } from "../../utils/error.handle"



export const sendMessage = async(content,Images,to)=>{
    const user = await userModel.findById(to)
    if (!user) {
        errorRes({
            msg:"user not found",
            statusCode:404
        })
        
    }
    const message = await messageModel.create({
        content,
        images,
        to
    })

    return {
        data:{
            message
        }
    }
}