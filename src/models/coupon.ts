import mongoose from 'mongoose';

const schema=new mongoose.Schema({

    code:{
        type:String,
        required:[true,"Please enter Coupon Code"],
        unique:true,
    },
    amount:{
        type:Number,
        required:[true,"Please enter the Discount Amount"],
    },
    
})

export const Coupon=mongoose.model("Coupon",schema)