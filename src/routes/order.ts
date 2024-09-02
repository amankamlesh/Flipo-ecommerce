import express from "express";
import {adminOnly} from "../middlewares/auth.js"
import { newOrder } from '../controllers/order.js';
import { myOrders } from '../controllers/order.js';
import { allOrders } from '../controllers/order.js';
import { getSingleOrder } from '../controllers/order.js';
import { processOrder, deleteOrder } from '../controllers/order.js';

const app=express.Router();
//route-/api/v1/order/new
app.post("/new",newOrder)

app.get("/my",myOrders)

app.get("/all",adminOnly,allOrders)

app.route("/:id").get(getSingleOrder)
.put(adminOnly,processOrder).delete(adminOnly,deleteOrder)
export default app;