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
        bio: z.string().optional()
    }),

    // query: z.strictObject({
    //     id: z.string()
    // })

};