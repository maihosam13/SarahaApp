import {createClient} from "redis";




export const redisClient = createClient({
    url:"redis://127.0.0.1:6379",
    database:1
})



redisClient.
on("error", (err)=>console.log("Redis Client Error",err))
.on("connect", ()=>console.log("Redis Client connected"))
.connect()