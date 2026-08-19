import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import Store from './models/Store.js';
import Product from './models/Product.js';
import Category from './models/Category.js';

function getLoremFlickrImage(keyword, seed, width = 400, height = 300) {
  // Clean the keyword to be just a simple word like 'pizza', 'burger', 'product'
  let cleanKw = (keyword || 'product').toLowerCase().replace(/[^a-z0-9]/g, ' ').trim().split(' ')[0];
  if (!cleanKw) cleanKw = 'product';
  return `https://loremflickr.com/${width}/${height}/${cleanKw},product?lock=${seed}`;
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Fixing MongoDB Products...");
    const products = await Product.find({}).populate('category');
    let productCount = 0;
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      if (!product.image || product.image.includes('mealdb') || product.image.includes('unsplash') || product.image.includes('dish_default') || product.image.includes('pollinations') || product.image.includes('loremflickr')) {
        const catName = product.category ? product.category.name : product.name;
        product.image = getLoremFlickrImage(product.name, i + 100);
        await product.save();
        productCount++;
      }
    }
    console.log(`Updated ${productCount} products with LoremFlickr Images.`);

    console.log("Fixing MongoDB Store Banners...");
    const stores = await Store.find({});
    let resCount = 0;
    for (let i = 0; i < stores.length; i++) {
      const res = stores[i];
      if (!res.bannerImage || res.bannerImage.includes('mealdb') || res.bannerImage.includes('unsplash') || res.bannerImage.includes('dish_default') || res.bannerImage.includes('pollinations') || res.bannerImage.includes('loremflickr')) {
        const cuisine = res.cuisineTypes[0] || 'product';
        res.bannerImage = getLoremFlickrImage(cuisine, i + 500, 800, 400);
        await res.save();
        resCount++;
      }
    }
    console.log(`Updated ${resCount} store banners with LoremFlickr Images.`);

    // Update Home.jsx
    const homePath = path.join(__dirname, '../frontend/src/pages/user/Home.jsx');
    let homeCode = fs.readFileSync(homePath, 'utf8');
    
    let jsCode = "export const STORES = [\n";
    let count = 0;
    for (const res of stores) {
      count++;
      const isVeg = res.cuisineTypes.includes('Desserts') || res.cuisineTypes.includes('Mithai') || res.cuisineTypes.includes('Bakery') || res.cuisineTypes.includes('Ice Cream') || res.cuisineTypes.includes('Healthy');
      let offer = "";
      if (Math.random() > 0.5) offer = "50% OFF";
      else if (Math.random() > 0.5) offer = "₹100 OFF";
      
      const cuisine = res.cuisineTypes[0] || 'product';
      const bannerImage = getLoremFlickrImage(cuisine, count + 500, 800, 400);
      jsCode += `  { id: '${res._id}', name: \`${res.name.replace(/`/g, "'")}\`, rating: ${res.rating}, costForTwo: ${res.costForTwo}, cuisineTypes: ${JSON.stringify(res.cuisineTypes)}, deliveryTime: ${res.deliveryTime}, image: '${bannerImage}', offer: '${offer}', isVeg: ${isVeg} },\n`;
    }
    jsCode += "];";

    homeCode = homeCode.replace(/export const STORES = \[[\s\S]*?\];/m, jsCode);
    
    // Add loading="lazy" to the images in Home.jsx
    homeCode = homeCode.replace(/<img src=\{res\.image\} alt=\{res\.name\} className="(.*?)" \/>/g, '<img src={res.image} alt={res.name} loading="lazy" className="$1" />');
    
    fs.writeFileSync(homePath, homeCode);
    console.log("Updated Home.jsx banners and added lazy loading.");

    // Update StoreDetails.jsx
    const detailsPath = path.join(__dirname, '../frontend/src/pages/user/StoreDetails.jsx');
    let detailsCode = fs.readFileSync(detailsPath, 'utf8');
    
    const replacementStr = `const getUniqueDishImage = (cuisine, idx) => {
  let cleanKw = (cuisine || 'product').toLowerCase().replace(/[^a-z0-9]/g, ' ').trim().split(' ')[0];
  if (!cleanKw) cleanKw = 'product';
  const seed = idx + 1000;
  return \`https://loremflickr.com/400/300/\${cleanKw},product?lock=\${seed}\`;
};`;
    
    const regex = /const getUniqueDishImage = \([\s\S]*?};/m;
    detailsCode = detailsCode.replace(regex, replacementStr);
    fs.writeFileSync(detailsPath, detailsCode);
    console.log("Updated StoreDetails.jsx.");

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
