import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import Store from './models/Store.js';

async function run() {
  try {
    // We already have the EXACT categorized dishes injected in StoreDetails.jsx!
    // Let's read them from there.
    const detailsPath = path.join(__dirname, '../frontend/src/pages/user/StoreDetails.jsx');
    const detailsCode = fs.readFileSync(detailsPath, 'utf8');
    const match = detailsCode.match(/const CATEGORIZED_DISHES = (\{[\s\S]*?\});/);
    if (!match) throw new Error("Could not find CATEGORIZED_DISHES in frontend");
    const CATEGORIZED_DISHES = JSON.parse(match[1]);

    const getUniqueBannerImage = (cuisines, idx) => {
      const keyword = (cuisines.join(' ') || '').toLowerCase();
      let cat = 'default';
      
      if (keyword.includes('pizza')) cat = 'pizza';
      else if (keyword.includes('burger')) cat = 'burger';
      else if (keyword.includes('indian') || keyword.includes('biryani') || keyword.includes('curry') || keyword.includes('mughlai') || keyword.includes('chicken') || keyword.includes('mutton') || keyword.includes('paneer')) cat = 'indian';
      else if (keyword.includes('cake') || keyword.includes('dessert') || keyword.includes('sweet') || keyword.includes('bakery') || keyword.includes('mithai')) cat = 'cake';
      else if (keyword.includes('salad') || keyword.includes('healthy') || keyword.includes('diet') || keyword.includes('bowl')) cat = 'salad';
      else if (keyword.includes('drink') || keyword.includes('beverage') || keyword.includes('shake') || keyword.includes('coffee') || keyword.includes('tea') || keyword.includes('mojito')) cat = 'drink';
      else if (keyword.includes('noodle') || keyword.includes('chinese') || keyword.includes('asian') || keyword.includes('pasta') || keyword.includes('momos')) cat = 'noodles';
      else if (keyword.includes('sandwich') || keyword.includes('wrap') || keyword.includes('roll') || keyword.includes('fast product') || keyword.includes('street')) cat = 'sandwich';
      else if (keyword.includes('ice') || keyword.includes('cream')) cat = 'icecream';
      
      let arr = CATEGORIZED_DISHES[cat];
      if (!arr || arr.length === 0) arr = CATEGORIZED_DISHES.default;
      
      const seed = keyword.charCodeAt(0) + (idx * 23) + (Math.floor(Math.random() * 100));
      return arr[seed % arr.length];
    };

    await mongoose.connect(process.env.MONGO_URI);
    const stores = await Store.find({});
    
    // 1. Fix MongoDB Store Banner Images
    let count = 0;
    for (const res of stores) {
      if (!res.bannerImage || res.bannerImage.includes('mealdb') || res.bannerImage.includes('unsplash') || res.bannerImage.includes('dish_default')) {
        res.bannerImage = getUniqueBannerImage(res.cuisineTypes, count);
        await res.save();
        count++;
      }
    }
    console.log(`Updated ${count} Store banners in MongoDB with EXACT categorized images.`);

    // 2. Fix Home.jsx Hardcoded STORES
    const homePath = path.join(__dirname, '../frontend/src/pages/user/Home.jsx');
    let homeCode = fs.readFileSync(homePath, 'utf8');
    
    let jsCode = "export const STORES = [\n";
    count = 0;
    for (const res of stores) {
      count++;
      const isVeg = res.cuisineTypes.includes('Desserts') || res.cuisineTypes.includes('Mithai') || res.cuisineTypes.includes('Bakery') || res.cuisineTypes.includes('Ice Cream') || res.cuisineTypes.includes('Healthy');
      let offer = "";
      if (Math.random() > 0.5) offer = "50% OFF";
      else if (Math.random() > 0.5) offer = "₹100 OFF";
      
      const bannerImage = getUniqueBannerImage(res.cuisineTypes, count);
      jsCode += `  { id: '${res._id}', name: \`${res.name.replace(/`/g, "'")}\`, rating: ${res.rating}, costForTwo: ${res.costForTwo}, cuisineTypes: ${JSON.stringify(res.cuisineTypes)}, deliveryTime: ${res.deliveryTime}, image: '${bannerImage}', offer: '${offer}', isVeg: ${isVeg} },\n`;
    }
    jsCode += "];";

    homeCode = homeCode.replace(/export const STORES = \[[\s\S]*?\];/m, jsCode);
    fs.writeFileSync(homePath, homeCode);
    console.log("Updated Home.jsx banners with EXACT categorized images.");

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
