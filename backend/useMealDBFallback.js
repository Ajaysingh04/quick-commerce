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

const mealdb = JSON.parse(fs.readFileSync(path.join(__dirname, 'mealdb_mapped.json'), 'utf8'));

function getMealDbImage(keyword, seed) {
  let cleanKw = (keyword || 'product').toLowerCase().replace(/[^a-z0-9]/g, ' ').trim().split(' ')[0];
  let cat = 'product';
  if (cleanKw.includes('pizza')) cat = 'pizza';
  else if (cleanKw.includes('burger') || cleanKw.includes('mac')) cat = 'burger';
  else if (cleanKw.includes('chicken')) cat = 'chicken';
  else if (cleanKw.includes('beef') || cleanKw.includes('steak')) cat = 'beef';
  else if (cleanKw.includes('fish') || cleanKw.includes('salmon') || cleanKw.includes('prawn')) cat = 'seaproduct';
  else if (cleanKw.includes('cake') || cleanKw.includes('tart') || cleanKw.includes('pie') || cleanKw.includes('pudding') || cleanKw.includes('dessert') || cleanKw.includes('sweet')) cat = 'dessert';
  else if (cleanKw.includes('pasta') || cleanKw.includes('spaghetti') || cleanKw.includes('penne')) cat = 'pasta';
  else if (cleanKw.includes('salad') || cleanKw.includes('healthy')) cat = 'salad';
  else if (cleanKw.includes('curry') || cleanKw.includes('masala') || cleanKw.includes('tikka') || cleanKw.includes('indian')) cat = 'indian';
  else if (cleanKw.includes('noodle')) cat = 'noodles';
  else if (cleanKw.includes('sandwich') || cleanKw.includes('wrap') || cleanKw.includes('roll')) cat = 'sandwich';
  else if (cleanKw.includes('pork') || cleanKw.includes('bacon')) cat = 'pork';
  else if (cleanKw.includes('beverage') || cleanKw.includes('shake') || cleanKw.includes('coffee') || cleanKw.includes('tea')) cat = 'product';
  else if (mealdb[cleanKw]) cat = cleanKw;
  
  if (!mealdb[cat] || mealdb[cat].length === 0) cat = 'product';
  
  const arr = mealdb[cat];
  return arr[seed % arr.length];
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Fixing MongoDB Products...");
    const products = await Product.find({}).populate('category');
    let productCount = 0;
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      if (product.image.includes('pollinations') || product.image.includes('loremflickr')) {
        const catName = product.category ? product.category.name : product.name;
        product.image = getMealDbImage(product.name + ' ' + catName, i + 1000);
        await product.save();
        productCount++;
      }
    }
    console.log(`Updated ${productCount} products with MealDB Images.`);

    console.log("Fixing MongoDB Store Banners...");
    const stores = await Store.find({});
    let resCount = 0;
    for (let i = 0; i < stores.length; i++) {
      const res = stores[i];
      if (res.bannerImage.includes('pollinations') || res.bannerImage.includes('loremflickr')) {
        const cuisine = res.cuisineTypes[0] || 'product';
        res.bannerImage = getMealDbImage(cuisine, i + 5000);
        await res.save();
        resCount++;
      }
    }
    console.log(`Updated ${resCount} store banners with MealDB Images.`);

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
      const bannerImage = getMealDbImage(cuisine, count + 5000);
      jsCode += `  { id: '${res._id}', name: \`${res.name.replace(/`/g, "'")}\`, rating: ${res.rating}, costForTwo: ${res.costForTwo}, cuisineTypes: ${JSON.stringify(res.cuisineTypes)}, deliveryTime: ${res.deliveryTime}, image: '${bannerImage}', offer: '${offer}', isVeg: ${isVeg} },\n`;
    }
    jsCode += "];";

    homeCode = homeCode.replace(/export const STORES = \[[\s\S]*?\];/m, jsCode);
    fs.writeFileSync(homePath, homeCode);
    console.log("Updated Home.jsx banners with MealDB.");

    // Update StoreDetails.jsx
    const detailsPath = path.join(__dirname, '../frontend/src/pages/user/StoreDetails.jsx');
    let detailsCode = fs.readFileSync(detailsPath, 'utf8');
    
    // First, ensure mealdb_mapped.json is imported
    if (!detailsCode.includes("import mealdb from '../../assets/mealdb_mapped.json'")) {
        detailsCode = detailsCode.replace("import React", "import mealdb from '../../assets/mealdb_mapped.json';\nimport React");
    }

    const replacementStr = `const getUniqueDishImage = (dishName, idx) => {
  let cleanKw = (dishName || 'product').toLowerCase().replace(/[^a-z0-9]/g, ' ').trim().split(' ')[0];
  let cat = 'product';
  if (cleanKw.includes('pizza')) cat = 'pizza';
  else if (cleanKw.includes('burger') || cleanKw.includes('mac')) cat = 'burger';
  else if (cleanKw.includes('chicken')) cat = 'chicken';
  else if (cleanKw.includes('beef') || cleanKw.includes('steak')) cat = 'beef';
  else if (cleanKw.includes('fish') || cleanKw.includes('salmon') || cleanKw.includes('prawn')) cat = 'seaproduct';
  else if (cleanKw.includes('cake') || cleanKw.includes('tart') || cleanKw.includes('pie') || cleanKw.includes('pudding') || cleanKw.includes('dessert') || cleanKw.includes('sweet')) cat = 'dessert';
  else if (cleanKw.includes('pasta') || cleanKw.includes('spaghetti') || cleanKw.includes('penne')) cat = 'pasta';
  else if (cleanKw.includes('salad') || cleanKw.includes('healthy')) cat = 'salad';
  else if (cleanKw.includes('curry') || cleanKw.includes('masala') || cleanKw.includes('tikka') || cleanKw.includes('indian')) cat = 'indian';
  else if (cleanKw.includes('noodle')) cat = 'noodles';
  else if (cleanKw.includes('sandwich') || cleanKw.includes('wrap') || cleanKw.includes('roll')) cat = 'sandwich';
  else if (cleanKw.includes('pork') || cleanKw.includes('bacon')) cat = 'pork';
  else if (cleanKw.includes('beverage') || cleanKw.includes('shake') || cleanKw.includes('coffee') || cleanKw.includes('tea')) cat = 'product';
  else if (mealdb[cleanKw]) cat = cleanKw;
  
  if (!mealdb[cat] || mealdb[cat].length === 0) cat = 'product';
  
  const arr = mealdb[cat];
  const seed = idx + 2000;
  return arr[seed % arr.length];
};`;
    
    const regex = /const getUniqueDishImage = \([\s\S]*?};/m;
    detailsCode = detailsCode.replace(regex, replacementStr);
    
    fs.writeFileSync(detailsPath, detailsCode);
    console.log("Updated StoreDetails.jsx to use MealDB.");

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
