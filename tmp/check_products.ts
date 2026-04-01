import mongoose from 'mongoose';
import dbConnect from '../db/dbConnect';
import Product from '../db/models/product';

async function checkProducts() {
  await dbConnect();
  const products = await Product.find({});
  console.log(`Total products: ${products.length}`);
  if (products.length > 0) {
    console.log('Sample product:', JSON.stringify(products[0], null, 2));
  }
  process.exit(0);
}

checkProducts().catch(err => {
  console.error(err);
  process.exit(1);
});
