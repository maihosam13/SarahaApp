import {hash,hashSync} from 'bcrypt'
// import {  hash} from "argon2";
import { compare } from "bcrypt";
// import { verify } from 'argon2';
import bcrypt from "bcrypt";



export const CreateHash=async(password)=>{
    const generatedHash = await hash(password,10)   //bcrypt

    // const generatedHash = await hash (password,{    //argon2
    //     memoryCost:1024*1024   //1MB
    // })
    return generatedHash
}



export const compareHash = async(password,hashedPassword)=>{
    const isMatch = await compare(password,hashedPassword)   //bcrypt
    // const isMatch = await verify(hashedPassword,password)     //argon2
    return isMatch
}