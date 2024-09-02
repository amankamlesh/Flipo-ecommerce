import express from "express";
import {adminOnly} from "../middlewares/auth.js"
import { newCoupon } from '../controllers/payment.js';
import { applyDiscount } from '../controllers/payment.js';
import { allCoupons } from '../controllers/payment.js';
import { deleteCoupon } from '../controllers/payment.js';
import { createPaymentIntent } from '../controllers/payment.js';

const app=express.Router();
//route-/api/v1/payment/create

app.post("/create",createPaymentIntent)

//route-/api/v1/payment/discount
app.get("/discount",applyDiscount)
//route-/api/v1/payment/coupon/new
app.post("/coupon/new",adminOnly,newCoupon)



app.get("/coupon/all",adminOnly,allCoupons)


app.delete("/coupon/:id",adminOnly,deleteCoupon);
export default app;