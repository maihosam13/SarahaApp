import crypto from "node:crypto";
import { errorRes } from "../error.handle.js";


const secretKey = Buffer.from("jhgfdsdfgtyuiuygfdfgh3456jhgfdfj")
export const encryption = (data)=>{
    const iv= crypto.randomBytes(16)
    const cipher = crypto.createCipheriv("aes-256-cbc",secretKey,iv)
    let cipherText = cipher.update(data,"utf8","hex")
    cipherText+=cipher.final("hex")

    return `${iv.toString("hex")}:${cipherText}`
}


export const decryption = (encryptedVale)=>{
    const[iv,cipherText] = encryptedVale.split(":")
    if(!iv || !cipherText){
        errorRes({
            msg:"in-valid encrypted value"
        })
    }

    const binaryIv = Buffer.from(iv,"hex")
    const decipher = crypto.createDecipheriv("aes-256-cbc",secretKey,binaryIv)
    let plaintext = decipher.update(cipherText,"hex","utf8")
    plaintext +=decipher.final("utf8")
    return plaintext
}