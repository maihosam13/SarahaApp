import chalk from "chalk";
import mongoose from "mongoose";








export const DBconnection = async ()=>{
    try {
        await mongoose.connect("mongodb://localhost:27017/sarahaApp4-7",{
            serverSelectionTimeoutMS:5000

        })
        console.log(chalk.green("DB Connected Successfully"));
        
    } catch (error) {
        console.log(chalk.red("DB failed connection =>",error));
        
    }
}