import { model, Schema, Types } from "mongoose";




const messageSchema = new Schema({
    content:{
        type:String,
        required:function (){
            return this.images?.length ? false :true
        }
    },
    images:{
        type:[String]
    },
    to:{
        type: Types.ObjectId,
        required:true,
        red:"User"
    }
},
{
    timestamps:true,
    strict:true,
    strictQuery:true,
    optimisticConcurrency:true,
    toJSON:{
        virtuals:true,
        getters:true,
        transform(doc,ret){
         delete ret.id
         
            return ret
        }
    },
    toObject:{
        virtuals:true,
        getters:true,
        transform(doc,ret){
            delete ret.id
            return ret
            console.log({
                ret
            });
            
        }
    },
}
)

export const messageModel = model("Message" , messageSchema)