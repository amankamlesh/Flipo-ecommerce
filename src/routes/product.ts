import express from "express";
import {adminOnly} from "../middlewares/auth.js"
import {newProduct} from "../controllers/product.js"
import {singleUpload} from "../middlewares/multer.js"
import { getlatestProducts } from '../controllers/product.js';
import { getAllCategories } from '../controllers/product.js';
import { getAdminProducts } from '../controllers/product.js';
import { getSingleProduct } from '../controllers/product.js';
import { updateProduct } from '../controllers/product.js';
import { deleteProduct } from '../controllers/product.js';
import { getAllProducts } from '../controllers/product.js';
const app=express.Router();

app.post("/new",adminOnly,singleUpload,newProduct)
//to get all product with filter
app.get("/all",getAllProducts)

app.get("/latest",getlatestProducts)

app.get("/categories",getAllCategories)



app.get("/admin-products",adminOnly,getAdminProducts);
//to get update and delete product
app
.route("/:id")
.get(getSingleProduct)
.put(adminOnly,singleUpload,updateProduct)
.delete(adminOnly,deleteProduct)

export default app;