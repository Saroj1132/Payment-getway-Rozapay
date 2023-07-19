var express = require('express');
var router = express.Router();
const joi = require('joi')
const transaction = require('../model/transaction')

router.post('/create-order', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    const { product_name, amount } = req.body;

    const orderObj = {
      amount: Number(amount).toFixed(2),
      product_name: product_name
    }

    await createSubscriptionRazorPayOrderId(orderObj, res)

  } catch (err) {
    res.status(501).send(err);
    return false;
  }
})

router.post('/verfiy-payment', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    const { order_id, payment_id, signature, payment_method } = req.body


    const validationSchema = joi.object({
      order_id: joi.string().required(),
      payment_id: joi.string().required(),
      signature: joi.string().required(),
      payment_method: joi.string().required()
    });

    const { error, value } = validationSchema.validate(req.body)

    if (error) {
      res.status(404).send(error.message)
      return;
    }

    const orderTransc = await transaction.findOne({order_id: order_id})

    if (!orderTransc) {
      res.status(401).json('Order not found')
      return;
    }
    console.log(orderTransc._id);
    let body = order_id + "|" + payment_id;

    var crypto = require("crypto");
    var expectedSignature = crypto.createHmac('sha256', process.env.KEYID)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === signature) {
      const paymentObj = {
        razorpay_payment_id: payment_id,
        razorpay_order_id: order_id,
        razorpay_signature: signature,
        payment_method: payment_method,
        payment_status: 'success',
      }

      await transaction.updateOne({
        order_id:order_id
      }, paymentObj).exec().then((success)=>{
        res.status(200).json("Payment Success");
      })
      return;
    } else {
      const paymentObj = {
        razorpay_payment_id: payment_id,
        razorpay_order_id: order_id,
        razorpay_signature: signature,
        payment_method: payment_method,
        payment_status: 'failed'
      }
      await transaction.updateOne({
        order_id:order_id
      }, paymentObj).exec().then((success)=>{
        res.status(200).json("Payment Failed");
      })
      return;
    }
  } catch (err) {
    res.status(502).send(err);

    return false;
  }
})

async function createSubscriptionRazorPayOrderId(payload, res) {
  const Razorpay = require('razorpay');
  const instance = new Razorpay({ key_id: process.env.KEYID, key_secret: process.env.KEYSUCCESS })
  const options = {
      amount: (payload.amount * 100).toFixed(0),  // amount in the smallest currency unit
      currency: "INR",
      receipt: payload.product_name
  };

  instance.orders.create(options, async function (err, order) {
      if (err) {
          res.status(400).send(err.error.description);
          return
      }
      const tansObj = {
          order_id: order.id,
          amount: payload.amount,
          product_name: payload.product_name
      }
      console.log(tansObj);
      transaction.create(tansObj).then(data => {

          const result = {
              order_id: order.id,
              amount: (order.amount / 100).toFixed(2)
          }
          res.status(201).send(result);
          return

      }).catch(err => {
        res.status(500).send(err.stack);
        return false;
      });


  });
}

module.exports = router;
