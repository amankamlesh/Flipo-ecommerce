import mongoose from "mongoose"
import { InvalidateCacheProps } from '../types/types.js';
import { myCache } from '../app.js';
import { Product } from '../models/product.js';
import { OrderItemType } from '../types/types.js';
import  { Document } from "mongoose";
export const connectDB=(uri:string)=>{
    mongoose.connect(uri,{
        dbName:"Ecommerce_24",
    
    }).then((c)=>console.log(`DB Connected to ${c.connection.host}`))
.catch((e)=>console.log(e));
};


export const invalidateCache=({product,order,admin,userId,orderId,productId}:InvalidateCacheProps)=>{

if(product){
  const productKeys: string[]=["latest-products","categories","all-products",];
  
  if(typeof productId === "string")
   productKeys.push(`product-${productId}`)

  if(typeof productId==="object") productId.forEach((i) => productKeys.push(`product-${i}`))

myCache.del(productKeys)
}
if(order){
    const orderKeys:string[]=[`all-orders`,`my-orders-${userId}`,`order-{orderId}`]

   myCache.del(orderKeys)
}
if(admin){
    myCache.del(["admin-stats","admin-pie-charts","admin-bar-charts",
        "admin-line-charts"
    ])
}

};


export const reduceStock=async(orderItems:OrderItemType[])=>{
    for(let i=0;i<orderItems.length;i++){
    const order=orderItems[i];
    const product=await Product.findById(order.productId);
    if(!product) throw new Error("Product Not Found");
    product.stock -=order.quantity;
    await product.save();
}
}

export const calculatePercentage= (thisMonth:number,lastMonth:number)=>{

if(lastMonth==0) return thisMonth*100;
    const percent=(thisMonth/lastMonth)*100;
    return Number(percent.toFixed(0));
}

export const getInventories=async({categories,productCount}:{
    categories:string[],
  productCount:number})=>{
    const categoriesCountPromise=categories.map(category=> Product.countDocuments({category}));

const categoriesCount=await Promise.all(categoriesCountPromise)

const categorycount:Record<string,number>[]=[];
categories.forEach((category,i)=>{
    categorycount.push({
        [category]:Math.round((categoriesCount[i]/productCount)*100),
    })
});
return categorycount;
}


interface MyDocument extends Document{
    createdAt: Date;
    discount?: number;
    total?: number;

}
type FuncProps={
    length:number;
    docArr:MyDocument[];
    today:Date;
    property?:"discount" | "total";
}

export const getChartData = ({ length, docArr, today, property }: FuncProps): number[] => {
    const data: number[] = new Array(length).fill(0);

    docArr.forEach((i) => {
        const creationDate = i.createdAt;
        const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;

        if (monthDiff < length) {
            data[length - monthDiff - 1] += property ? i[property] || 0 : 1;
        }
    });

    return data;
};