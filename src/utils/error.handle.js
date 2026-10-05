

export const errorRes=({msg="Error",statusCode=500})=>{
     throw new Error(msg,{
            cause:{
                statusCode
            }
        })
}
