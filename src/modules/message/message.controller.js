import { Router } from "express"
import { uploadFile } from "../../utils/multer"
import { sendMessage } from "./message.service"
import { successRes } from "../../utils/success.res"
const router =Router ()
export const routes = {
    base:"/messages",
    send:"/send" //post
}




router.post(routes.send,uploadFile("messages").array("images",5) ,async(req,res)=>{
    const {content ,to } = req.body
    const images = req.files.map(ele=>ele.path)
    const {data} = await sendMessage(content , images,to)
    successRes({
        res,
        data
    })
})  






export default router