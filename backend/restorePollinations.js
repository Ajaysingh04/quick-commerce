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

function getPollinationsImage(keyword, seed, width = 400, height = 300) {
  let cleanKw = (keyword || 'product').replace(/[^a-zA-Z0-9 ]/g, ' ').trim();
  const prompt = `delicious ${cleanKw} product photography professional studio lighting`;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&nologo=true&seed=${seed}`;
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Fixing MongoDB Products to use Pollinations AI again...");
    const products = await Product.find({}).populate('category');
    let productCount = 0;
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      if (product.image.includes('loremflickr')) {
        product.image = getPollinationsImage(product.name, i + 1000);
        await product.save();
        productCount++;
      }
    }
    console.log(`Updated ${productCount} products with Pollinations Images.`);

    console.log("Fixing MongoDB Store Banners to use Pollinations AI...");
    const stores = await Store.find({});
    let resCount = 0;
    for (let i = 0; i < stores.length; i++) {
      const res = stores[i];
      if (res.bannerImage.includes('loremflickr')) {
        const cuisine = res.cuisineTypes[0] || 'product';
        res.bannerImage = getPollinationsImage(`${cuisine} spread`, i + 5000, 800, 400);
        await res.save();
        resCount++;
      }
    }
    console.log(`Updated ${resCount} store banners with Pollinations Images.`);

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
      const bannerImage = getPollinationsImage(`${cuisine} spread`, count + 5000, 800, 400);
      jsCode += `  { id: '${res._id}', name: \`${res.name.replace(/`/g, "'")}\`, rating: ${res.rating}, costForTwo: ${res.costForTwo}, cuisineTypes: ${JSON.stringify(res.cuisineTypes)}, deliveryTime: ${res.deliveryTime}, image: '${bannerImage}', offer: '${offer}', isVeg: ${isVeg} },\n`;
    }
    jsCode += "];";

    homeCode = homeCode.replace(/export const STORES = \[[\s\S]*?\];/m, jsCode);
    fs.writeFileSync(homePath, homeCode);
    console.log("Updated Home.jsx banners with Pollinations.");

    // Update StoreDetails.jsx
    const detailsPath = path.join(__dirname, '../frontend/src/pages/user/StoreDetails.jsx');
    let detailsCode = fs.readFileSync(detailsPath, 'utf8');
    
    const replacementStr = `const getUniqueDishImage = (dishName, idx) => {
  let cleanKw = (dishName || 'product').replace(/[^a-zA-Z0-9 ]/g, ' ').trim();
  const prompt = \`delicious \${cleanKw} product photography professional studio lighting\`;
  return \`https://image.pollinations.ai/prompt/\${encodeURIComponent(prompt)}?width=400&height=300&nologo=true&seed=\${idx + 2000}\`;
};`;
    
    const regex = /const getUniqueDishImage = \([\s\S]*?};/m;
    detailsCode = detailsCode.replace(regex, replacementStr);
    
    fs.writeFileSync(detailsPath, detailsCode);
    console.log("Updated StoreDetails.jsx to use Pollinations.");

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
