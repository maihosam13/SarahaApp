export const userPrefixKey =(userId)=> `users:${userId}:otp`



export const confirmEmailKey = (userId)=>  `${userPrefixKey(userId)}:confirmEmail`
export const resendOtpKey = (userId)=>  `${userPrefixKey(userId)}:resend`
export const attemptsKeys =(userId)=>`${userPrefixKey(userId)}:attempts`
export const attemptsBlockedKeys =(userId)=>`${userPrefixKey(userId)}:block`
export const attemptsBlockedCountKeys =(userId)=>`${userPrefixKey(userId)}:blockCount`



export const userSessionJwtIdPrefixKey = (userId)=>{
    return `users:${userId}:session`
}


export const userSessionJwtIdKey = (userId , jwtid)=>{
    return `${userSessionJwtIdPrefixKey(userId)}:${jwtid}`
}