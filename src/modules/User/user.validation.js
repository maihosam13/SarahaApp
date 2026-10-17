import {z, object } from 'zod'
import { GenderEnum } from "./user.types.js";
import { Query } from 'mongoose';





export const signupSchema = {

    body: z.strictObject({
        firstName: z.string(),
        lastName: z.string(),
        email: z.email(),
        phone: z.string().max(15).min(10),
        password: z.string(),
        age: z.number().optional(),
        gender: z.enum(GenderEnum),
        userName: z.string(),
        bio: z.string().optional(),
        confirmPassword:z.string()
    })


    .refine((arg)=>arg.password==arg.confirmPassword , {
        error:"password mismatch",
        path:["password","confirmPassword"]
    })

    // query: z.strictObject({
    //     id: z.string()
    // })

}



export const resetPasswordSchema = {
    body:z.strictObject({
        email:z.email(),
        otp:z.string().min(6).max(6),
        password:z.string(),
        confirmPassword:z.string()
    }).refine((arg)=>arg.password==arg.confirmPassword , {
        error:"password mismatch",
        path:["password","confirmPassword"]
    })
}