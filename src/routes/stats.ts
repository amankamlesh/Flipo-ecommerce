import express from "express";
import {adminOnly} from "../middlewares/auth.js"
import { getPieCharts, getBarCharts, getLineCharts } from '../controllers/stats.js';
import { getDashboardStats } from '../controllers/stats.js';

const app=express.Router();
//route-/api/v1/dashboard/new
app.get("/stats",adminOnly,getDashboardStats);

app.get("/pie",adminOnly,getPieCharts);

app.get("/bar",adminOnly,getBarCharts);

app.get("/line",adminOnly,getLineCharts)

export default app;