const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = mongoose.Schema({
    
    product_name:{
        type:String,
        require:true
    },
    order_id:{
        type:String,
        default:'public'
    },
    razorpay_payment_id:{
        type:String,
        require:true
    },
    razorpay_order_id:{
        type:String,
        require:true
    },
    razorpay_signature:{
        type:String,
        require:true
    },
    amount:{
        type:String,
        require:true
    },
    // expire_time:{
    //     type:Date,
    //     default:Date.now()
    // },
    payment_method:{
        type:String,
        require:true
    },
    payment_status:{
        type:String,
        require:true
    }    
});

var user_subscription=mongoose.model("user_subscription", transactionSchema)

module.exports=user_subscription