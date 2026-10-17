
import multer, { diskStorage, memoryStorage } from "multer";
import fs from "fs/promises"

export const uploadFile = (dest= "/general")=>{

    const storage = diskStorage({
        destination:async(req,file,cb)=>{
            const userId = req.user._id
            const folderName = `./uploads/${dest}/${userId}`
            try {
                await fs.access(folderName)
            } catch (error) {
               await  fs.mkdir(folderName,{
                recursive:true

               }
            )
            }
            cb(null,folderName)
        },
        filename:(req,file,cb)=>{
            const username = req.user.userName
            const filename= username + " _ " +Date.now() + " _ " + file.originalname
            cb(null,filename)

        }
    })
    return multer({
        storage
    })
}





export const callback = (err,name)=>{
    if (err) {
        throw new Error(err);
        
    }
    console.log(" Hello " + name);
    
}