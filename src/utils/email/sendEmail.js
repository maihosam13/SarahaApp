import nodemailer from "nodemailer"



export const sendEmail = async({to,subject,html})=>{
    const transporter = nodemailer.createTransport({
        auth:{
            user:process.env.USER,
            pass:process.env.PASS
        },
        service:"gmail",
    }) 



    const info = await transporter.sendMail({
        from:" sarahaApp <saraha app@gmail.com> ",
        to,
        subject,
        html

    })

    console.log(info.accepted);
    
}