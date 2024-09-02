import { Request, Response, NextFunction } from 'express';
import { TryCatch } from '../middlewares/error.js';
import { NewProductRequestBody } from '../types/types.js';
import { Product } from '../models/product.js';
import ErrorHandler from '../utils/utility-class.js';
import { rm } from 'fs/promises';
import path from "path";
import { SearchRequestQuery, BaseQuery } from '../types/types.js';
import {  faker} from "@faker-js/faker";
import { myCache } from '../app.js';
import { invalidateCache } from '../utils/features.js';
// Create a new product





// check latest changes and revalidate it(new,update,delete product & orders)
export const getlatestProducts = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    
    let products;

    if(myCache.has("latest-products")) products=JSON.parse(myCache.get("latest-products") as string);


else{
    products = await Product.find({}).sort({ createdAt: -1 }).limit(5);

myCache.set("latest-products",JSON.stringify(products));
}

    return res.status(200).json({
        success: true,
        products,
    });
})

// check latest changes and revalidate it(new,update,delete product & orders)
// Get all unique categories
export const getAllCategories = TryCatch(async (req: Request, res: Response, next: NextFunction) => {

  let categories;
  
   if(myCache.has("categories"))
    categories=JSON.parse(myCache.get("categories") as string);
 
   else{
     categories = await Product.distinct('category');
    myCache.set("categories",JSON.stringify(categories));
}
    return res.status(200).json({
        success: true,
        categories,
    });
});
// check latest changes and revalidate it(new,update,delete product & orders)
// Get all products
export const getAdminProducts = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    
    let products;
    if(myCache.has("all-products"))
        products=JSON.parse(myCache.get("all-products") as string);
    else{
    products = await Product.find({});
    myCache.set("all-products",JSON.stringify(products))
    }
    return res.status(200).json({
        success: true,
        products,
    });
});

// Get a single product by ID
export const getSingleProduct = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    
    let product;
    const id=req.params.id
    if(myCache.has(`product-${id}`)) product=JSON.parse(myCache.get(`product-${id}`) as string)
        else{
    product = await Product.findById(id);

if (!product) return next(new ErrorHandler('Product not found', 404));
    
   myCache.set(`product-${id}`,JSON.stringify(product))

    }

    return res.status(200).json({
        success: true,
        product,
    });
});

export const newProduct = TryCatch(async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {
    const { name, price, stock, category } = req.body;
    const photo = req.file;
    //console.log(req.file)
    if (!photo) {
        return next(new ErrorHandler('Please add photo', 400));
    }

    if (!name || !price || !stock || !category) {
        await rm(photo.path);
        return next(new ErrorHandler('Please enter all fields', 400));
    }

    await Product.create({
        name,
        price,
        stock,
        category: category.toLowerCase(),
        photo: photo?.path,
    });

     invalidateCache({product:true,admin:true});

    return res.status(201).json({
        success: true,
        message: 'Product Created Successfully',
    });
});

// Update a product
export const updateProduct = TryCatch(async (req: Request<{ id: string }, {}, NewProductRequestBody>, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { name, price, stock, category } = req.body;
    const photo = req.file;

    const product = await Product.findById(id);
    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    if (photo) {
        await rm(product.photo!);
        product.photo = photo.path;
    }

    if (name) product.name = name;
    if (price) product.price = price;
    if (stock) product.stock = stock;
    if (category) product.category = category.toLowerCase();

    await product.save();

    invalidateCache({product:true,
        productId:String(product._id),admin:true
    });
    return res.status(200).json({
        success: true,
        message: 'Product Updated Successfully',
    });
});

// Delete a product
export const deleteProduct = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    await rm(product.photo!);
    await product.deleteOne({ _id: product._id });

    invalidateCache({product:true,
        productId:String(product._id),admin:true
    });
    return res.status(200).json({
        success: true,
        message: 'Product Deleted Successfully',
    });
});


export const getAllProducts = TryCatch(async (req: Request<{},{},{},SearchRequestQuery >, res: Response, next: NextFunction) => {
    const {search,sort,category,price}=req.query;

    const page=Number(req.query.page) || 1;

    const limit=Number(process.env.PRODUCT_PER_PAGE )|| 8;
  
   const skip=(page - 1)*limit;
   
 const baseQuery:BaseQuery={
    // price:{
    //     $lte:Number(price),
    // },
    // category,
}
 if(search) 
   baseQuery.name={
    $regex:search,  //to find pattern
    $options:"i",

};
   if(price)  baseQuery.price={
    $lte:Number(price)
   };
   if(category) baseQuery.category=category

   const productsPromise=Product.find(baseQuery)
   .sort(sort && {price: sort === "asc"  ? 1:  -1})
   .limit(limit)
   .skip(skip);


   const [products,filteredOnlyProduct]=await Promise.all([
    productsPromise,
    Product.find(baseQuery)
   ])
  console.log(filteredOnlyProduct.length/limit)
 let totalPage=Math.ceil(filteredOnlyProduct.length /limit);
    return res.status(200).json({
        success: true,
        products,
        totalPage,
    });
});
//  const generateRandomProducts=async (count: number = 10)=>{
//     const products=[]
//     for(let i=0 ; i<count ; i++ ){
//         const product={
//             name: faker.commerce.productName(),
//          photo: "uploads\\ 9556df2f-a1fe-4a7f-a1b7-9fc6d91899d1.png",

//          price: faker.commerce.price({ min: 1500, max: 80000, dec: 0 }),

//          stock: faker.commerce.price({ min: 0, max: 100, dec: 0 }),
//          category: faker.commerce.department(),
//          createdAt: new Date(faker.date.past()),
//          updatedAt: new Date(faker.date.recent()),  
//         }
//         products.push(product);
//           }
        
//           await Product.create(products); 
//     }
 

   // generateRandomProducts(40);

//    const deleteRandomsProducts = async (count: number = 10) => {
//       const products = await Product.find({}).skip(2);
    
//       for (let i = 0; i < products.length; i++) {
//         const product = products[i];
//         await product.deleteOne();
//       }};